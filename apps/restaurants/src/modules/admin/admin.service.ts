import { Injectable, NotFoundException, BadRequestException, ForbiddenException, Inject } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Restaurant } from '../restaurant/schemas/restaurant.schema';
import { Transaction, TransactionStatus, TransactionType } from './schemas/transaction.schema';
import { Dispute } from '../dispute/schemas/dispute.schema';
import { DisputeStatus } from '../dispute/enums/dispute-status.enum';
import { getModelToken } from '@nestjs/mongoose';
import { UserDocument } from '@app/common';
@Injectable()
export class AdminService {
  constructor(
    
    @Inject(getModelToken(Restaurant.name)) private readonly restaurantModel: Model<Restaurant>,
    @Inject(getModelToken(Transaction.name)) private readonly transactionModel: Model<Transaction>,
    @Inject(getModelToken(Dispute.name)) private readonly disputeModel: Model<Dispute>,
  ) {}

  
 
  // Restaurant Verification
  async getPendingVerifications(page: number = 1, limit: number = 10) {
    const skip = (page - 1) * limit;
    const query = {
      isApproved: false,
      isActive: true
    };

    const [restaurants, total] = await Promise.all([
      this.restaurantModel
        .find(query)
        .skip(skip)
        .limit(limit)
        .populate('owner', 'name email')
        .exec(),
      this.restaurantModel.countDocuments(query)
    ]);

    return {
      data: restaurants,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  async verifyRestaurant(restaurantId: string, approved: boolean, notes?: string) {
    const restaurant = await this.restaurantModel.findById(restaurantId);
    
    if (!restaurant) {
      throw new NotFoundException('Restaurant not found');
    }
  
  
      // Approval logic
      restaurant.isApproved = true;
      restaurant.isActive = true;
      restaurant.verificationNotes = notes || 'Approved';
      restaurant.status = 'approved';
    
   
   
  
    return await restaurant.save();
  }
  
  async rejectRestaurant(restaurantId: string, notes: string) {
    const restaurant = await this.restaurantModel.findById(restaurantId);
    if (!restaurant) {
      throw new NotFoundException('Restaurant not found');
    }

    restaurant.isApproved = false;
    restaurant.rejectionReason = notes;
    restaurant.status = 'rejected'; // Ensure rejected status is set
    return restaurant.save();
  }

  async createRestaurant(restaurantData: any) {
    const restaurant = new this.restaurantModel(restaurantData);
    restaurant.status = 'pending'; // Initially set the status as 'pending' for new restaurants
    return restaurant.save();
  }

  async getAllRestaurants(page: number = 1, limit: number = 10) {
    const skip = (page - 1) * limit;
  
    const [data, total] = await Promise.all([
      this.restaurantModel
        .find()
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .exec(),
      this.restaurantModel.countDocuments()
    ]);
  
    return {
      data,
      meta: {
        total,
        page,
        lastPage: Math.ceil(total / limit),
      },
    };
  }

  async updatePendingVerification(restaurantId: string, updateData: {
    isApproved?: boolean;
    verificationNotes?: string;
    rejectionReason?: string;
  }) {
    const restaurant = await this.restaurantModel.findById(restaurantId);
    if (!restaurant) {
      throw new NotFoundException('Restaurant not found');
    }

    // Prepare update data with all necessary fields
    const update = {
      ...updateData,
      isActive: updateData.isApproved,
      verificationDate: new Date(),
      status: updateData.isApproved ? 'approved' : 'rejected',
      // Add these fields to ensure permanent changes
      verifiedAt: new Date(),
      verificationStatus: updateData.isApproved ? 'approved' : 'rejected',
      lastStatusChange: new Date()
    };

    // Use findByIdAndUpdate with { new: true } to get the updated document
    const updatedRestaurant = await this.restaurantModel.findByIdAndUpdate(
      restaurantId,
      { $set: update },
      { new: true, runValidators: true }
    );

    if (!updatedRestaurant) {
      throw new NotFoundException('Failed to update restaurant');
    }

    return updatedRestaurant;
  }

  // Financial Management
  async getTransactions(page: number = 1, limit: number = 10, filters: any = {}, adminId: string) {
    const skip = (page - 1) * limit;
    const query: any = {};

    if (filters.status) query.status = filters.status;
    if (filters.type) query.type = filters.type;
    if (filters.startDate) query.createdAt = { $gte: filters.startDate };
    if (filters.endDate) query.createdAt = { ...query.createdAt, $lte: filters.endDate };

    const [transactions, total] = await Promise.all([
      this.transactionModel
        .find(query)
        .skip(skip)
        .limit(limit)
        .populate('customer', 'name email')
        .populate('restaurant', 'name')
        .exec(),
      this.transactionModel.countDocuments(query)
    ]);

    return {
      data: transactions,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  async processRestaurantPayout(restaurantId: string, amount: number, adminId: string) {
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
        paymentDate: new Date()
      },
      platformFee: 0,
      netAmount: amount
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
      this.disputeModel.countDocuments(query)
    ]);

    return {
      data: disputes,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
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
      notes: resolution
    };
    dispute.resolvedBy = new Types.ObjectId(adminId);
    dispute.resolvedAt = new Date();
    return dispute.save();
  }

  // Financial Reports
  async generateFinancialReport(startDate: Date, endDate: Date, adminId: string) {
    const transactions = await this.transactionModel
      .find({
        createdAt: { $gte: startDate, $lte: endDate }
      })
      .populate('restaurant', 'name')
      .exec();

    const report = {
      period: { startDate, endDate },
      totalTransactions: transactions.length,
      totalRevenue: transactions.reduce((sum, t) => sum + t.amount, 0),
      totalPlatformFees: transactions.reduce((sum, t) => sum + t.platformFee, 0),
      totalPayouts: transactions
        .filter(t => t.type === TransactionType.RESTAURANT_PAYOUT)
        .reduce((sum, t) => sum + t.amount, 0),
      totalRefunds: transactions
        .filter(t => t.type === TransactionType.REFUND)
        .reduce((sum, t) => sum + t.amount, 0),
      byRestaurant: {},
      byTransactionType: {}
    };

    // Group by restaurant
    transactions.forEach(t => {
      if (t.restaurantId) {
        const restaurantId = t.restaurantId.toString();
        if (!report.byRestaurant[restaurantId]) {
          report.byRestaurant[restaurantId] = {
            name: t.restaurantId['name'],
            total: 0,
            fees: 0,
            payouts: 0
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
    transactions.forEach(t => {
      if (!report.byTransactionType[t.type]) {
        report.byTransactionType[t.type] = 0;
      }
      report.byTransactionType[t.type] += t.amount;
    });

    return report;
  }
}
