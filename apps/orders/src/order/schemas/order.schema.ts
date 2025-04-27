import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type OrderDocument = Order & Document;

@Schema({ timestamps: true })
export class Order {
  @Prop()
  customerId: string;

  @Prop({ type: [{ itemId: String, name: String, quantity: Number, price: Number }] })
  items: {
    itemId: string;
    name: string;
    quantity: number;
    price: number;
  }[];

  @Prop({
    type: {
      houseNumber: { type: String },
      lane1: { type: String },
      lane2: { type: String },
      city: { type: String },
      district: { type: String },
    },
  })
  deliveryAddress: {
    houseNumber: string;
    lane1: string;
    lane2?: string;
    city: string;
    district: string;
  };

  @Prop()
  deliveryFee: number;

  @Prop({ default: 'pending' })
  status: string;

  @Prop({ default: 'unpaid' })
  paymentStatus: string;

  @Prop()
  totalAmount: number;
}

export const OrderSchema = SchemaFactory.createForClass(Order);
