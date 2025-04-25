import { Injectable, NotFoundException } from '@nestjs/common';
import { Model, Types } from 'mongoose';
import { Customer, CustomerDocument } from './schemas/customer.schema';
import { Restaurant } from '../modules/restaurant/schemas/restaurant.schema';
import { MenuItem } from '../modules/menu/schemas/menu-item.schema';
import { Inject } from '@nestjs/common';
import { getModelToken } from '@nestjs/mongoose';

@Injectable()
export class CustomerService {
  constructor(
    @Inject(getModelToken(Restaurant.name))
    private readonly restaurantModel: Model<Restaurant>,
    @Inject(getModelToken(MenuItem.name))
    private readonly menuItemModel: Model<MenuItem>,
  ) {}

  async getApprovedRestaurants(page: number = 1, limit: number = 10) {
    const skip = (page - 1) * limit;
    const query = {
      isApproved: true,
      isActive: true,
      isTemporarilyClosed: false,
    };

    const [restaurants, total] = await Promise.all([
      this.restaurantModel
        .find(query)
        .select('-__v -createdAt -updatedAt')
        .populate('owner', 'name email')
        .skip(skip)
        .limit(limit)
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

  async getRestaurantMenu(restaurantId: string) {
    const restaurant = await this.restaurantModel.findById(restaurantId).exec();
    if (!restaurant) {
      throw new NotFoundException('Restaurant not found');
    }

    if (!restaurant.isApproved || !restaurant.isActive) {
      throw new NotFoundException('Restaurant is not available');
    }

    const menuItems = await this.menuItemModel
      .find({ restaurant: restaurantId as any })
      .sort('category')
      .exec();

    // Group menu items by category
    const menuByCategory = menuItems.reduce(
      (acc: { [key: string]: MenuItem[] }, item) => {
        const categoryName = item.category || 'Uncategorized';
        if (!acc[categoryName]) {
          acc[categoryName] = [];
        }
        acc[categoryName].push(item);
        return acc;
      },
      {},
    );

    return menuByCategory;
  }
}
