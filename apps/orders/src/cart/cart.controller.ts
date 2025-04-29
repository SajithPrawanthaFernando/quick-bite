import {
  Controller,
  Post,
  Get,
  Delete,
  Param,
  Body,
  Put,
  UseGuards,
} from '@nestjs/common';
import { CartService } from './cart.service';
import { OrderService } from '../order/order.service';
import { Order } from '../order/schemas/order.schema';
import { Address } from '../order/dto/address.dto';
import { CurrentUser, JwtAuthGuard, UserDto } from '@app/common';

@Controller('cart')
export class CartController {
  constructor(
    private readonly cartService: CartService,
    private readonly orderService: OrderService, // Inject OrderService
  ) {}

  @Post(':customerId/add')
  async addItem(@Param('customerId') customerId: string, @Body() item: any) {
    return this.cartService.addToCart(customerId, item);
  }

  @Get(':customerId')
  async viewCart(@Param('customerId') customerId: string) {
    return this.cartService.getCart(customerId);
  }

  @Delete(':customerId/item/:itemId')
  async removeItem(
    @Param('customerId') customerId: string,
    @Param('itemId') itemId: string,
  ) {
    return this.cartService.removeItem(customerId, itemId);
  }

  @Delete(':customerId/clear')
  async clearCart(@Param('customerId') customerId: string) {
    return this.cartService.clearCart(customerId);
  }

  @UseGuards(JwtAuthGuard)
  @Post(':customerId/checkout')
  async checkout(
    @Param('customerId') customerId: string,

    @Body()
    body: {
      deliveryAddress: Address;
      charge: {
        amount: number;
        card: {
          number: string;
          exp_month: number;
          exp_year: number;
          cvc: string;
        };
      };
    },
    @CurrentUser() user: UserDto,
  ): Promise<Order | any> {
    const { deliveryAddress, charge } = body;

    const cart = await this.cartService.getCart(customerId);

    if (!cart || cart.items.length === 0) {
      return { message: 'Cart is empty' };
    }

    const totalDeliveryFee = 150;

    const totalPrice = cart.items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0,
    );

    const order = await this.orderService.createOrder(
      {
        customerId,
        items: cart.items,
        deliveryAddress,
        deliveryFee: totalDeliveryFee,
        totalAmount: totalPrice + totalDeliveryFee,
        charge,
      },
      user,
    );

    await this.cartService.clearCart(customerId);

    return order;
  }

  @Put(':customerId/item/:itemId')
  async updateItemQuantity(
    @Param('customerId') customerId: string,
    @Param('itemId') itemId: string,
    @Body('quantity') quantity: number,
  ) {
    return this.cartService.updateItemQuantity(customerId, itemId, quantity);
  }
}
