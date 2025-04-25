// src/modules/restaurant/restaurant.service.ts
import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  ConflictException,
} from '@nestjs/common';
import { Inject } from '@nestjs/common';
import { Model, Types, FilterQuery } from 'mongoose';
import { Restaurant } from './schemas/restaurant.schema';
import { CreateRestaurantDto } from './dto/create-restaurant.dto';
import { UpdateRestaurantDto } from './dto/update-restaurant.dto';
import { getModelToken } from '@nestjs/mongoose';
import { Order } from '../order/schemas/order.schema';
import { MenuItem } from '../menu/schemas/menu-item.schema';
import { UserDocument } from '@app/common';

@Injectable()
export class RestaurantService {
  constructor(
    @Inject(getModelToken('Restaurant'))
    private readonly restaurantModel: Model<Restaurant>,
    @Inject(getModelToken(UserDocument.name))
    private readonly userModel: Model<UserDocument>,
    @Inject(getModelToken(Order.name))
    private readonly orderModel: Model<Order>,
    @Inject(getModelToken(MenuItem.name))
    private readonly menuItemModel: Model<MenuItem>,
  ) {}

  async getAllRestaurants(
    page: number = 1,
    limit: number = 10,
    search?: string,
    cuisineType?: string,
    rating?: number,
  ) {
    const skip = (page - 1) * limit;

    const query: any = {};

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    if (cuisineType) {
      query.cuisineType = cuisineType;
    }

    if (rating) {
      query.rating = { $gte: rating };
    }

    const [restaurants, total] = await Promise.all([
      this.restaurantModel
        .find(query)
        .skip(skip)
        .limit(limit)
        .select('-__v')
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

  async getPendingRestaurants(
    page: number = 1,
    limit: number = 10,
    userId: string,
  ) {
    // Check if user is admin
    const user = await this.userModel.findById(userId);

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
        .select('-__v')
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

  async getRestaurantById(id: string) {
    const restaurant = await this.restaurantModel.findById(id).exec();

    if (!restaurant) {
      throw new NotFoundException(`Restaurant with ID ${id} not found`);
    }

    return restaurant;
  }

  async createRestaurant(
    createRestaurantDto: CreateRestaurantDto,
    userId: string,
  ): Promise<Restaurant> {
    const { latitude, longitude, ...rest } = createRestaurantDto;

    const newRestaurant = new this.restaurantModel({
      ...rest,
      owner: new Types.ObjectId(userId),
      location: {
        type: 'Point',
        coordinates: [longitude, latitude],
      },
      latitude,
      longitude,
      isApproved: false,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    return newRestaurant.save();
  }

  async updateRestaurant(
    id: string,
    updateRestaurantDto: UpdateRestaurantDto,
    userId: string,
  ) {
    // Check if restaurant exists
    const restaurant = await this.restaurantModel.findById(id).exec();

    if (!restaurant) {
      throw new NotFoundException(`Restaurant with ID ${id} not found`);
    }

    return this.restaurantModel
      .findByIdAndUpdate(id, updateRestaurantDto, { new: true })
      .exec();
  }

  async setTemporaryClosure(id: string, isClosed: boolean, userId: string) {
    const restaurant = await this.restaurantModel.findById(id).exec();

    if (!restaurant) {
      throw new NotFoundException(`Restaurant with ID ${id} not found`);
    }

    if (restaurant.owner.toString() !== userId) {
      throw new ForbiddenException(
        'You do not have permission to update this restaurant',
      );
    }

    return this.restaurantModel
      .findByIdAndUpdate(id, { isTemporarilyClosed: isClosed }, { new: true })
      .exec();
  }

  async deleteRestaurant(id: string, user: any) {
    const restaurant = await this.restaurantModel.findById(id).exec();

    if (!restaurant) {
      throw new NotFoundException(`Restaurant with ID ${id} not found`);
    }

    return this.restaurantModel.findByIdAndDelete(id).exec();
  }

  async approveRestaurant(id: string, userId: string) {
    // Check if user is admin
    const user = await this.userModel.findById(userId);

    const restaurant = await this.restaurantModel.findById(id).exec();

    if (!restaurant) {
      throw new NotFoundException(`Restaurant with ID ${id} not found`);
    }

    return this.restaurantModel
      .findByIdAndUpdate(id, { isApproved: true }, { new: true })
      .exec();
  }

  async rejectRestaurant(id: string, reason: string) {
    const restaurant = await this.restaurantModel.findById(id).exec();

    if (!restaurant) {
      throw new NotFoundException(`Restaurant with ID ${id} not found`);
    }

    // We don't delete the restaurant, just mark it as inactive
    return this.restaurantModel
      .findByIdAndUpdate(id, { isActive: false }, { new: true })
      .exec();
  }

  async getRestaurantOrders(restaurantId: string, userId: string) {
    // Find restaurant owned by the user
    const restaurant = await this.restaurantModel
      .findOne({
        _id: new Types.ObjectId(restaurantId),
        owner: new Types.ObjectId(userId),
      })
      .exec();
    if (!restaurant) {
      throw new ForbiddenException('You do not own this restaurant');
    }

    // Get orders for this restaurant
    return this.orderModel
      .find({ restaurantId: restaurant._id })
      .sort({ createdAt: -1 })
      .populate('customer', 'name email')
      .exec();
  }

  async getRestaurantMenu(restaurantId: string, userId: string) {
    // Find restaurant owned by the user
    const restaurant = await this.restaurantModel
      .findOne({
        _id: new Types.ObjectId(restaurantId),
        owner: new Types.ObjectId(userId),
      })
      .exec();
    if (!restaurant) {
      throw new ForbiddenException('You do not own this restaurant');
    }

    // Get menu items for this restaurant
    return this.menuItemModel
      .find({ restaurant: restaurant._id })
      .sort('category')
      .exec();
  }

  async getOwnerDashboard(restaurantId: string) {
    // Find restaurant
    const restaurant = await this.restaurantModel.findById(restaurantId).exec();
    if (!restaurant) {
      throw new NotFoundException('Restaurant not found');
    }

    // Get dashboard data
    const [totalOrders, activeOrders, menuItems] = await Promise.all([
      this.orderModel.countDocuments({ restaurantId: restaurant._id } as any),
      this.orderModel.countDocuments({
        restaurantId: restaurant._id,
        status: { $in: ['PENDING', 'ACCEPTED', 'PREPARING'] },
      } as any),
      this.menuItemModel.countDocuments({ restaurant: restaurant._id }),
    ]);

    return {
      restaurant: {
        name: restaurant.name,
        status: restaurant.isActive ? 'Active' : 'Inactive',
        isApproved: restaurant.isApproved,
      },
      stats: {
        totalOrders,
        activeOrders,
        menuItems,
      },
    };
  }

  async findById(id: string): Promise<Restaurant | null> {
    const restaurant = await this.restaurantModel.findById(id).exec();
    if (!restaurant) {
      throw new NotFoundException(`Restaurant with ID ${id} not found`);
    }
    return restaurant;
  }

  async update(
    id: string,
    updateData: Partial<Restaurant>,
  ): Promise<Restaurant | null> {
    const restaurant = await this.restaurantModel
      .findByIdAndUpdate(id, updateData, { new: true })
      .exec();
    if (!restaurant) {
      throw new NotFoundException(`Restaurant with ID ${id} not found`);
    }
    return restaurant;
  }

  async delete(id: string): Promise<Restaurant | null> {
    const restaurant = await this.restaurantModel.findByIdAndDelete(id).exec();
    if (!restaurant) {
      throw new NotFoundException(`Restaurant with ID ${id} not found`);
    }
    return restaurant;
  }

  async findAll(): Promise<Restaurant[]> {
    const query: FilterQuery<Restaurant> = { isApproved: true, isActive: true };
    return this.restaurantModel.find(query).exec();
  }

  async toggleStatus(
    id: string,
    isActive: boolean,
  ): Promise<Restaurant | null> {
    const restaurant = await this.restaurantModel
      .findByIdAndUpdate(id, { isActive }, { new: true })
      .exec();
    if (!restaurant) {
      throw new NotFoundException(`Restaurant with ID ${id} not found`);
    }
    return restaurant;
  }

  async toggleTemporaryClosure(
    id: string,
    isClosed: boolean,
  ): Promise<Restaurant | null> {
    const restaurant = await this.restaurantModel
      .findByIdAndUpdate(id, { isTemporarilyClosed: isClosed }, { new: true })
      .exec();
    if (!restaurant) {
      throw new NotFoundException(`Restaurant with ID ${id} not found`);
    }
    return restaurant;
  }
}
