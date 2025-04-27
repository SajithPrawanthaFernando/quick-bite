import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Cart, CartDocument } from './schemas/cart.schema';

@Injectable()
export class CartService {
  constructor(@InjectModel(Cart.name) private cartModel: Model<CartDocument>) {}

  async addToCart(customerId: string, item: any) {
    const cart = await this.cartModel.findOne({ customerId });
    if (cart) {
      const existing = cart.items.find((i) => i.itemId === item.itemId);
      if (existing) {
        existing.quantity += item.quantity;
      } else {
        cart.items.push(item);
      }
      return cart.save();
    } else {
      const newCart = new this.cartModel({
        customerId,
        items: [item],
      });
      return newCart.save();
    }
  }

  async getCart(customerId: string) {
    return this.cartModel.findOne({ customerId }).exec();
  }

  async removeItem(customerId: string, itemId: string) {
    return this.cartModel
      .findOneAndUpdate(
        { customerId },
        { $pull: { items: { itemId } } },
        { new: true },
      )
      .exec();
  }

  async clearCart(customerId: string) {
    return this.cartModel
      .findOneAndUpdate({ customerId }, { items: [] }, { new: true })
      .exec();
  }

  async updateItemQuantity(
    customerId: string,
    itemId: string,
    newQuantity: number,
  ): Promise<any> {
    const cart = await this.cartModel.findOne({ customerId });

    if (!cart) {
      return { message: 'Cart not found' };
    }

    const item = cart.items.find((item) => item.itemId === itemId);

    if (!item) {
      return { message: 'Item not found in cart' };
    }

    item.quantity = newQuantity;
    await cart.save();

    return { message: 'Item quantity updated successfully', cart };
  }
}
