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
import { JwtAuthGuard, Roles } from '@app/common';

@Controller('orders')
export class OrderController {
  constructor(private readonly orderService: OrderService) {
    console.log('OrderController initialized');
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  async createOrder(@Body() createOrderDto: CreateOrderDto) {
    return this.orderService.createOrder(createOrderDto);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  async getOrder(@Param('id') id: string) {
    return this.orderService.getOrder(id);
  }

  @UseGuards(JwtAuthGuard)
  @Put(':id')
  async updateOrder(@Param('id') id: string, @Body() body: any) {
    return this.orderService.updateOrder(id, body);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async cancelOrder(@Param('id') id: string) {
    return this.orderService.cancelOrder(id);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':orderId/status')
  async getOrderStatus(@Param('orderId') orderId: string) {
    return this.orderService.getOrderStatusById(orderId);
  }

  @UseGuards(JwtAuthGuard)
  @Get('customer/:customerId/orders')
  async getCustomerOrders(@Param('customerId') customerId: string) {
    return this.orderService.getAllOrdersForCustomer(customerId);
  }

  @UseGuards(JwtAuthGuard)
  @Roles('admin')
  @Put(':orderId/status')
  async updateOrderStatus(
    @Param('orderId') orderId: string,
    @Body('status') status: string,
  ) {
    return this.orderService.updateOrderStatus(orderId, status);
  }
}
