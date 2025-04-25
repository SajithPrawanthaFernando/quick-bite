// src/modules/menu/menu.service.ts
import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { Inject } from '@nestjs/common';
import { Model, Types, FilterQuery } from 'mongoose';
import { MenuItem } from './schemas/menu-item.schema';
import { Restaurant } from '../restaurant/schemas/restaurant.schema';
import { CreateMenuItemDto } from './dto/create-menu-item.dto';
import { UpdateMenuItemDto } from './dto/update-menu-item.dto';
import { getModelToken } from '@nestjs/mongoose';

@Injectable()
export class MenuService {
  constructor(
    @Inject(getModelToken('MenuItem'))
    private readonly menuItemModel: Model<MenuItem>,
    @Inject(getModelToken('Restaurant'))
    private readonly restaurantModel: Model<Restaurant>,
  ) {}

  async getMenuItems(restaurantId: string, category?: string) {
    const query: any = {
      restaurant: new Types.ObjectId(restaurantId),
    };

    if (category) {
      query.category = category;
    }

    const menuItems = await this.menuItemModel
      .find(query)
      .sort('category')
      .exec();

    // Group menu items by category if no specific category is requested
    if (!category) {
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

    return menuItems;
  }

  async getMenuItemById(id: string) {
    const menuItem = await this.menuItemModel.findById(id).exec();

    if (!menuItem) {
      throw new NotFoundException(`Menu item with ID ${id} not found`);
    }

    return menuItem;
  }

  async createMenuItem(createMenuItemDto: CreateMenuItemDto, userId: string) {
    if (!createMenuItemDto.restaurant) {
      throw new ForbiddenException(
        'Restaurant ID is required to create a menu item',
      );
    }

    const restaurantId = new Types.ObjectId(createMenuItemDto.restaurant);

    // Check if restaurant exists
    const restaurant = await this.restaurantModel.findById(restaurantId).exec();

    if (!restaurant) {
      throw new NotFoundException(
        `Restaurant with ID ${restaurantId} not found`,
      );
    }

    // Create menu item
    const menuItem = new this.menuItemModel({
      ...createMenuItemDto,
      restaurant: restaurantId,
    });
    return menuItem.save();
  }

  async updateMenuItem(
    id: string,
    updateMenuItemDto: UpdateMenuItemDto,
    userId: string,
  ) {
    // Get the menu item first
    const menuItem = await this.menuItemModel.findById(id).exec();
    if (!menuItem) {
      throw new NotFoundException(`Menu item with ID ${id} not found`);
    }

    // Check if user owns the restaurant
    const restaurant = await this.restaurantModel
      .findOne({
        _id: menuItem.restaurant,
        owner: new Types.ObjectId(userId),
      } as FilterQuery<Restaurant>)
      .exec();

    if (!restaurant) {
      throw new ForbiddenException(
        'You do not have permission to update this menu item',
      );
    }

    const updateData: any = { ...updateMenuItemDto };
    if (updateData.restaurant) {
      updateData.restaurant = new Types.ObjectId(updateData.restaurant);
    }

    return this.menuItemModel
      .findByIdAndUpdate(id, updateData, { new: true })
      .exec();
  }

  async deleteMenuItem(id: string, userId: string) {
    // Get the menu item first
    const menuItem = await this.menuItemModel.findById(id).exec();
    if (!menuItem) {
      throw new NotFoundException(`Menu item with ID ${id} not found`);
    }

    // Check if user owns the restaurant
    const restaurant = await this.restaurantModel
      .findOne({
        _id: menuItem.restaurant,
        owner: new Types.ObjectId(userId),
      } as FilterQuery<Restaurant>)
      .exec();

    if (!restaurant) {
      throw new ForbiddenException(
        'You do not have permission to delete this menu item',
      );
    }

    return this.menuItemModel.findByIdAndDelete(id).exec();
  }

  async toggleAvailability(id: string, isAvailable: boolean, userId: string) {
    // Get the menu item first
    const menuItem = await this.menuItemModel.findById(id).exec();
    if (!menuItem) {
      throw new NotFoundException(`Menu item with ID ${id} not found`);
    }

    // Check if user owns the restaurant
    const restaurant = await this.restaurantModel
      .findOne({
        _id: menuItem.restaurant,
        owner: new Types.ObjectId(userId),
      } as FilterQuery<Restaurant>)
      .exec();

    if (!restaurant) {
      throw new ForbiddenException(
        'You do not have permission to update this menu item',
      );
    }

    return this.menuItemModel
      .findByIdAndUpdate(id, { isAvailable }, { new: true })
      .exec();
  }
}
