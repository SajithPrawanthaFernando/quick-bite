import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema()
export class OrderItem extends Document {
  @Prop({ type: Types.ObjectId, ref: 'MenuItem', required: true })
  menuItem: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Order', required: true })
  order: Types.ObjectId;

  @Prop({ required: true, min: 1 })
  quantity: number;

  @Prop({ required: true })
  unitPrice: number;

  @Prop()
  specialInstructions: string;
}

export const OrderItemSchema = SchemaFactory.createForClass(OrderItem); 