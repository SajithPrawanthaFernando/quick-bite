import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Order, OrderDocument } from './schemas/order.schema';
import { CreateOrderDto } from './dto/create-order.dto';

@Injectable()
export class OrderService {
  constructor(
    @InjectModel(Order.name) private orderModel: Model<OrderDocument>,
  ) {}

  async createOrder(dto: CreateOrderDto): Promise<Order> {
    const newOrder = new this.orderModel({
      ...dto,
      status: 'pending',
      paymentStatus: 'unpaid',
    });
    return newOrder.save();
  }

  async getOrder(id: string): Promise<Order | null> {
    return this.orderModel.findById(id).exec();
  }

  async updateOrder(
    id: string,
    updates: Partial<Order>,
  ): Promise<Order | null> {
    return this.orderModel.findByIdAndUpdate(id, updates, { new: true }).exec();
  }

  async cancelOrder(id: string): Promise<Order | null> {
    return this.orderModel
      .findByIdAndUpdate(id, { status: 'cancelled' }, { new: true })
      .exec();
  }

  async getOrderStatusById(orderId: string): Promise<any> {
    const order = await this.orderModel.findById(orderId).exec();
    if (!order) {
      return { message: 'Order not found' };
    }
    return { status: order.status };
  }

  async getAllOrdersForCustomer(customerId: string): Promise<any> {
    return this.orderModel.find({ customerId }).exec();
  }

  async updateOrderStatus(orderId: string, newStatus: string): Promise<any> {
    const order = await this.orderModel.findById(orderId).exec();
    if (!order) {
      return { message: 'Order not found' };
    }

    order.status = newStatus;
    await order.save();

    return { message: `Order status updated to ${newStatus}`, order };
  }

  async getOrdersOutForDelivery(): Promise<Order[]> {
    return this.orderModel.find().exec();
  }
}
