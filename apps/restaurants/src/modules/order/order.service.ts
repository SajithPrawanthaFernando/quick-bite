import { Injectable, NotFoundException } from '@nestjs/common';
import { Inject } from '@nestjs/common';
import { Model, Types } from 'mongoose';
import { Order } from './schemas/order.schema';
import { OrderItem } from './schemas/order-item.schema';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { getModelToken } from '@nestjs/mongoose';
import { MenuItem } from '../menu/schemas/menu-item.schema';
import { MenuModule } from '../menu/menu.module';
@Injectable()
export class OrderService {
  constructor(
    @Inject(getModelToken('Order')) private orderModel: Model<Order>,

    private eventEmitter: EventEmitter2,
  ) {}

  async findAll(): Promise<Order[]> {
    return this.orderModel.find().exec();
  }

  async findAllByRestaurant(restaurantId: string): Promise<Order[]> {
    return this.orderModel.find({ restaurantId }).exec();
  }

  async findOne(id: string): Promise<Order> {
    const order = await this.orderModel.findById(id).exec();
    if (!order) {
      throw new NotFoundException(`Order with ID ${id} not found`);
    }
    return order;
  }

  async updateStatus(
    id: string,
    updateOrderStatusDto: UpdateOrderStatusDto,
  ): Promise<Order> {
    const order = await this.orderModel.findById(id).exec();
    if (!order) {
      throw new NotFoundException(`Order with ID ${id} not found`);
    }

    order.status = updateOrderStatusDto.status;

    if (updateOrderStatusDto.estimatedPreparationTime) {
      order.estimatedPreparationTime =
        updateOrderStatusDto.estimatedPreparationTime;
    }

    if (updateOrderStatusDto.rejectionReason) {
      order.rejectionReason = updateOrderStatusDto.rejectionReason;
    }

    return order.save();
  }
}
