import { Injectable, NotFoundException, Inject } from '@nestjs/common';
import { Model, Types } from 'mongoose';
import {
  FinancialTransaction,
  FinancialTransactionDocument,
  TransactionType,
  TransactionStatus,
} from './schemas/financial-transaction.schema';
import {
  FinancialReport,
  FinancialReportDocument,
} from './schemas/financial-report.schema';
import { Order } from '../order/schemas/order.schema';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { getModelToken } from '@nestjs/mongoose';

@Injectable()
export class FinanceService {
  private readonly PLATFORM_FEE_PERCENTAGE = 0.15;

  constructor(
    @Inject(getModelToken(FinancialTransaction.name))
    private readonly transactionModel: Model<FinancialTransactionDocument>,
    @Inject(getModelToken(FinancialReport.name))
    private readonly reportModel: Model<FinancialReportDocument>,
    @Inject(getModelToken(Order.name))
    private readonly orderModel: Model<Order>,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async processOrderPayment(order: Order): Promise<void> {
    const session = await this.transactionModel.db.startSession();
    session.startTransaction();

    try {
      // Create order payment transaction
      const orderPayment = new this.transactionModel({
        type: TransactionType.ORDER_PAYMENT,
        status: TransactionStatus.COMPLETED,
        order: order._id,
        restaurant: order.restaurantId,
        amount: order.totalAmount,
        description: `Payment for order ${order._id}`,
      });

      // Create platform fee transaction
      const platformFee = new this.transactionModel({
        type: TransactionType.PLATFORM_FEE,
        status: TransactionStatus.COMPLETED,
        order: order._id,
        restaurant: order.restaurantId,
        amount: order.totalAmount * this.PLATFORM_FEE_PERCENTAGE,
        description: `Platform fee for order ${order._id}`,
      });

      await Promise.all([
        orderPayment.save({ session }),
        platformFee.save({ session }),
      ]);

      await session.commitTransaction();
      this.eventEmitter.emit('order.payment.processed', { orderId: order._id });
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }

  async generateFinancialReport(
    restaurantId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<FinancialReport> {
    const transactions = await this.transactionModel
      .find({
        restaurant: new Types.ObjectId(restaurantId),
        createdAt: { $gte: startDate, $lte: endDate },
      })
      .exec();

    const orders = await this.orderModel
      .find({
        restaurantId: new Types.ObjectId(restaurantId),
        createdAt: { $gte: startDate, $lte: endDate },
      })
      .exec();

    // Calculate daily breakdown
    const dailyBreakdown = orders.reduce((acc, order) => {
      const date = order.createdAt.toISOString().split('T')[0];
      if (!acc[date]) {
        acc[date] = {
          orders: 0,
          revenue: 0,
          fees: 0,
          earnings: 0,
        };
      }
      acc[date].orders++;
      acc[date].revenue += order.totalAmount;
      acc[date].fees += order.totalAmount * this.PLATFORM_FEE_PERCENTAGE;
      acc[date].earnings +=
        order.totalAmount * (1 - this.PLATFORM_FEE_PERCENTAGE);
      return acc;
    }, {});

    // Calculate payment method breakdown
    const paymentMethodBreakdown = orders.reduce((acc, order) => {
      const method = order.paymentStatus;
      if (!acc[method]) {
        acc[method] = {
          orders: 0,
          revenue: 0,
        };
      }
      acc[method].orders++;
      acc[method].revenue += order.totalAmount;
      return acc;
    }, {});

    const report = new this.reportModel({
      restaurant: new Types.ObjectId(restaurantId),
      startDate,
      endDate,
      totalOrders: orders.length,
      totalRevenue: transactions
        .filter((t) => t.type === TransactionType.ORDER_PAYMENT)
        .reduce((sum, t) => sum + t.amount, 0),
      platformFees: transactions
        .filter((t) => t.type === TransactionType.PLATFORM_FEE)
        .reduce((sum, t) => sum + t.amount, 0),
      restaurantEarnings:
        transactions
          .filter((t) => t.type === TransactionType.ORDER_PAYMENT)
          .reduce((sum, t) => sum + t.amount, 0) -
        transactions
          .filter((t) => t.type === TransactionType.PLATFORM_FEE)
          .reduce((sum, t) => sum + t.amount, 0),
      pendingPayouts: transactions
        .filter(
          (t) =>
            t.type === TransactionType.RESTAURANT_PAYOUT &&
            t.status === TransactionStatus.PENDING,
        )
        .reduce((sum, t) => sum + t.amount, 0),
      completedPayouts: transactions
        .filter(
          (t) =>
            t.type === TransactionType.RESTAURANT_PAYOUT &&
            t.status === TransactionStatus.COMPLETED,
        )
        .reduce((sum, t) => sum + t.amount, 0),
      breakdown: {
        byDay: dailyBreakdown,
        byPaymentMethod: paymentMethodBreakdown,
      },
    });

    return report.save();
  }

  async initiateRestaurantPayout(
    restaurantId: string,
    amount: number,
  ): Promise<FinancialTransaction> {
    const pendingPayouts = await this.transactionModel
      .find({
        restaurant: new Types.ObjectId(restaurantId),
        type: TransactionType.RESTAURANT_PAYOUT,
        status: TransactionStatus.PENDING,
      })
      .exec();

    if (pendingPayouts.length > 0) {
      throw new Error('There are already pending payouts for this restaurant');
    }

    const payout = new this.transactionModel({
      type: TransactionType.RESTAURANT_PAYOUT,
      status: TransactionStatus.PENDING,
      restaurant: new Types.ObjectId(restaurantId),
      amount,
      description: `Payout request for restaurant ${restaurantId}`,
    });

    return payout.save();
  }

  async completeRestaurantPayout(
    payoutId: string,
  ): Promise<FinancialTransaction> {
    const payout = await this.transactionModel.findById(payoutId);
    if (!payout) {
      throw new NotFoundException('Payout not found');
    }

    payout.status = TransactionStatus.COMPLETED;
    return payout.save();
  }

  async getRestaurantTransactions(restaurantId: string, page = 1, limit = 10) {
    const skip = (page - 1) * limit;
    const [transactions, total] = await Promise.all([
      this.transactionModel
        .find({ restaurant: new Types.ObjectId(restaurantId) })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('order', 'totalAmount paymentStatus')
        .exec(),
      this.transactionModel.countDocuments({
        restaurant: new Types.ObjectId(restaurantId),
      }),
    ]);

    return {
      data: transactions,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async processRefund(order: Order, amount: number): Promise<void> {
    const session = await this.transactionModel.db.startSession();
    session.startTransaction();

    try {
      // Create refund transaction
      const refund = new this.transactionModel({
        type: TransactionType.REFUND,
        status: TransactionStatus.COMPLETED,
        order: order._id,
        restaurant: order.restaurantId,
        amount: -amount, // Negative amount for refund
        description: `Refund for order ${order._id}`,
      });

      // Create platform fee refund
      const platformFeeRefund = new this.transactionModel({
        type: TransactionType.PLATFORM_FEE,
        status: TransactionStatus.COMPLETED,
        order: order._id,
        restaurant: order.restaurantId,
        amount: -(amount * this.PLATFORM_FEE_PERCENTAGE), // Negative amount for refund
        description: `Platform fee refund for order ${order._id}`,
      });

      await Promise.all([
        refund.save({ session }),
        platformFeeRefund.save({ session }),
      ]);

      await session.commitTransaction();
      this.eventEmitter.emit('order.refund.processed', {
        orderId: order._id,
        amount,
      });
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }
}
