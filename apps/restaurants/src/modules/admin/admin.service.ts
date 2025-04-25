import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
  Inject,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Restaurant } from '../restaurant/schemas/restaurant.schema';
import {
  Transaction,
  TransactionStatus,
  TransactionType,
} from './schemas/transaction.schema';
import { Dispute } from '../dispute/schemas/dispute.schema';
import { DisputeStatus } from '../dispute/enums/dispute-status.enum';
import { getModelToken } from '@nestjs/mongoose';
import { UserDocument } from '@app/common';

@Injectable()
export class AdminService {
  constructor(
    @Inject(getModelToken(UserDocument.name))
    private readonly userModel: Model<UserDocument>,
    @Inject(getModelToken(Restaurant.name))
    private readonly restaurantModel: Model<Restaurant>,
    @Inject(getModelToken(Transaction.name))
    private readonly transactionModel: Model<Transaction>,
    @Inject(getModelToken(Dispute.name))
    private readonly disputeModel: Model<Dispute>,
  ) {}

  // User Account Management
  async getAllUsers(page: number = 1, limit: number = 10, role?: string) {
    const skip = (page - 1) * limit;
    const query: any = {};

    if (role) {
      query.role = role;
    }

    const [users, total] = await Promise.all([
      this.userModel
        .find(query)
        .skip(skip)
        .limit(limit)
        .select('-password')
        .exec(),
      this.userModel.countDocuments(query),
    ]);

    return {
      data: users,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  // async suspendUser(userId: string, reason: string, adminId: string) {
  //   const user = await this.userModel.findById(userId);
  //   if (!user) {
  //     throw new NotFoundException('User not found');
  //   }

  //   user.isActive = false;
  //   user.suspensionReason = reason;
  //   return user.save();
  // }

  // async reactivateUser(userId: string, adminId: string) {
  //   const user = await this.userModel.findById(userId);
  //   if (!user) {
  //     throw new NotFoundException('User not found');
  //   }

  //   user.isActive = true;
  //   user.suspensionReason = undefined;
  //   return user.save();
  // }

  // Restaurant Verification
  async getPendingVerifications(page: number = 1, limit: number = 10) {
    const skip = (page - 1) * limit;
    const query = {
      isApproved: false,
      isActive: true,
    };

    const [restaurants, total] = await Promise.all([
      this.restaurantModel
        .find(query)
        .skip(skip)
        .limit(limit)
        .populate('owner', 'name email')
        .exec(),
      this.restaurantModel.countDocuments(query),
    ]);

    return {
      data: restaurants,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async verifyRestaurant(
    restaurantId: string,
    approved: boolean,
    adminId: string,
    notes?: string,
  ) {
    const restaurant = await this.restaurantModel.findById(restaurantId).exec();
    if (!restaurant) {
      throw new NotFoundException(
        `Restaurant with ID ${restaurantId} not found`,
      );
    }

    restaurant.isApproved = approved;
    if (notes) {
      restaurant.verificationNotes = notes;
    }

    return restaurant.save();
  }

  async rejectRestaurant(restaurantId: string, notes: string, adminId: string) {
    const restaurant = await this.restaurantModel.findById(restaurantId);
    if (!restaurant) {
      throw new NotFoundException('Restaurant not found');
    }

    restaurant.isApproved = false;
    restaurant.rejectionReason = notes;
    return restaurant.save();
  }

  async updatePendingVerification(
    restaurantId: string,
    adminId: string,
    updateData: {
      isApproved?: boolean;
      verificationNotes?: string;
      rejectionReason?: string;
    },
  ) {
    const restaurant = await this.restaurantModel.findById(restaurantId);
    if (!restaurant) {
      throw new NotFoundException('Restaurant not found');
    }

    if (restaurant.isApproved) {
      throw new BadRequestException('Restaurant is already approved');
    }

    const update: any = {};
    if (updateData.isApproved !== undefined) {
      update.isApproved = updateData.isApproved;
      update.verifiedBy = new Types.ObjectId(adminId);
      update.verifiedAt = new Date();
    }
    if (updateData.verificationNotes) {
      update.verificationNotes = updateData.verificationNotes;
    }
    if (updateData.rejectionReason) {
      update.rejectionReason = updateData.rejectionReason;
      update.isActive = false;
    }

    return this.restaurantModel.findByIdAndUpdate(restaurantId, update, {
      new: true,
    });
  }

  // Financial Management
  async getTransactions(
    page: number = 1,
    limit: number = 10,
    filters: any = {},
    adminId: string,
  ) {
    const skip = (page - 1) * limit;
    const query: any = {};

    if (filters.status) query.status = filters.status;
    if (filters.type) query.type = filters.type;
    if (filters.startDate) query.createdAt = { $gte: filters.startDate };
    if (filters.endDate)
      query.createdAt = { ...query.createdAt, $lte: filters.endDate };

    const [transactions, total] = await Promise.all([
      this.transactionModel
        .find(query)
        .skip(skip)
        .limit(limit)
        .populate('customer', 'name email')
        .populate('restaurant', 'name')
        .exec(),
      this.transactionModel.countDocuments(query),
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

  async processRestaurantPayout(
    restaurantId: string,
    amount: number,
    adminId: string,
  ) {
    const restaurant = await this.restaurantModel.findById(restaurantId);
    if (!restaurant) {
      throw new NotFoundException('Restaurant not found');
    }

    const transaction = new this.transactionModel({
      amount,
      type: TransactionType.RESTAURANT_PAYOUT,
      status: TransactionStatus.PENDING,
      restaurant: restaurantId,
      description: 'Restaurant payout',
      paymentMethod: 'bank_transfer',
      paymentDetails: {
        transactionId: `PAYOUT-${Date.now()}`,
        paymentGateway: 'bank',
        paymentDate: new Date(),
      },
      platformFee: 0,
      netAmount: amount,
    });

    return transaction.save();
  }

  // Dispute Management
  async getDisputes(page: number = 1, limit: number = 10, status?: string) {
    const skip = (page - 1) * limit;
    const query: any = {};

    if (status) {
      query.status = status;
    }

    const [disputes, total] = await Promise.all([
      this.disputeModel
        .find(query)
        .skip(skip)
        .limit(limit)
        .populate('customer', 'name email')
        .populate('restaurant', 'name')
        .populate('transaction')
        .exec(),
      this.disputeModel.countDocuments(query),
    ]);

    return {
      data: disputes,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async resolveDispute(disputeId: string, adminId: string, resolution: string) {
    const dispute = await this.disputeModel.findById(disputeId);
    if (!dispute) {
      throw new NotFoundException('Dispute not found');
    }

    dispute.status = DisputeStatus.RESOLVED;
    dispute.resolution = {
      decision: resolution,
      resolutionDate: new Date(),
      notes: resolution,
    };
    dispute.resolvedBy = new Types.ObjectId(adminId);
    dispute.resolvedAt = new Date();
    return dispute.save();
  }

  // Financial Reports
  async generateFinancialReport(
    startDate: Date,
    endDate: Date,
    adminId: string,
  ) {
    const transactions = await this.transactionModel
      .find({
        createdAt: { $gte: startDate, $lte: endDate },
      })
      .populate('restaurant', 'name')
      .exec();

    const report = {
      period: { startDate, endDate },
      totalTransactions: transactions.length,
      totalRevenue: transactions.reduce((sum, t) => sum + t.amount, 0),
      totalPlatformFees: transactions.reduce(
        (sum, t) => sum + t.platformFee,
        0,
      ),
      totalPayouts: transactions
        .filter((t) => t.type === TransactionType.RESTAURANT_PAYOUT)
        .reduce((sum, t) => sum + t.amount, 0),
      totalRefunds: transactions
        .filter((t) => t.type === TransactionType.REFUND)
        .reduce((sum, t) => sum + t.amount, 0),
      byRestaurant: {},
      byTransactionType: {},
    };

    // Group by restaurant
    transactions.forEach((t) => {
      if (t.restaurantId) {
        const restaurantId = t.restaurantId.toString();
        if (!report.byRestaurant[restaurantId]) {
          report.byRestaurant[restaurantId] = {
            name: t.restaurantId['name'],
            total: 0,
            fees: 0,
            payouts: 0,
          };
        }
        report.byRestaurant[restaurantId].total += t.amount;
        report.byRestaurant[restaurantId].fees += t.platformFee;
        if (t.type === TransactionType.RESTAURANT_PAYOUT) {
          report.byRestaurant[restaurantId].payouts += t.amount;
        }
      }
    });

    // Group by transaction type
    transactions.forEach((t) => {
      if (!report.byTransactionType[t.type]) {
        report.byTransactionType[t.type] = 0;
      }
      report.byTransactionType[t.type] += t.amount;
    });

    return report;
  }
}
