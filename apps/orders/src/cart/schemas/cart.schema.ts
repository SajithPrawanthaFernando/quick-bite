import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type CartDocument = Cart & Document;

@Schema({ timestamps: true })
export class Cart {
  @Prop({ required: true })
  customerId: string;

  @Prop({
    type: [
      {
        itemId: String,
        name: String,
        price: Number,
        quantity: Number,
      },
    ],
  })
  items: {
    itemId: string;
    name: string;
    price: number;
    quantity: number;
  }[];
}

export const CartSchema = SchemaFactory.createForClass(Cart);
