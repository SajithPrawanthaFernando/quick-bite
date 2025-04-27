import {
  Body,
  Controller,
  Post,
  Get,
  Param,
  Put,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { OrderService } from './order.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { CurrentUser, JwtAuthGuard, Roles, UserDto } from '@app/common';

@Controller('orders')
export class OrderController {
  constructor(private readonly orderService: OrderService) {
    console.log('OrderController initialized');
  }

  @Post()
  async createOrder(
    @Body() createOrderDto: CreateOrderDto,
    @CurrentUser() user: UserDto,
  ) {
    console.log('Creating order for user:', user);
    return this.orderService.createOrder(createOrderDto, user);
  }

  @Get(':id')
  async getOrder(@Param('id') id: string) {
    return this.orderService.getOrder(id);
  }

  @Put(':id')
  async updateOrder(@Param('id') id: string, @Body() body: any) {
    return this.orderService.updateOrder(id, body);
  }

  @Delete(':id')
  async cancelOrder(@Param('id') id: string) {
    return this.orderService.cancelOrder(id);
  }

  @Get(':orderId/status')
  async getOrderStatus(@Param('orderId') orderId: string) {
    return this.orderService.getOrderStatusById(orderId);
  }

  @Get('customer/:customerId/orders')
  async getCustomerOrders(@Param('customerId') customerId: string) {
    return this.orderService.getAllOrdersForCustomer(customerId);
  }

  @Roles('admin')
  @Put(':orderId/status')
  async updateOrderStatus(
    @Param('orderId') orderId: string,
    @Body('status') status: string,
  ) {
    return this.orderService.updateOrderStatus(orderId, status);
  }
}
