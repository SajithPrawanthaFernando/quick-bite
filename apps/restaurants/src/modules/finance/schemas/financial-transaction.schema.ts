import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { Restaurant } from '../../restaurant/schemas/restaurant.schema';

export enum TransactionType {
  ORDER_PAYMENT = 'ORDER_PAYMENT',
  PLATFORM_FEE = 'PLATFORM_FEE',
  RESTAURANT_PAYOUT = 'RESTAURANT_PAYOUT',
  REFUND = 'REFUND',
}

export enum TransactionStatus {
  PENDING = 'PENDING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
}

export type FinancialTransactionDocument = FinancialTransaction & Document;

@Schema({ timestamps: true })
export class FinancialTransaction {
  @Prop({ type: String, enum: TransactionType, required: true })
  type: TransactionType;

  @Prop({
    type: String,
    enum: TransactionStatus,
    default: TransactionStatus.PENDING,
  })
  status: TransactionStatus;

  @Prop({ type: Types.ObjectId, ref: 'Order' })
  order?: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Restaurant', required: true })
  restaurant: Types.ObjectId;

  @Prop({ type: Number, required: true })
  amount: number;

  @Prop({ type: String })
  description?: string;

  @Prop({ type: Object })
  metadata?: Record<string, any>;
}

export const FinancialTransactionSchema =
  SchemaFactory.createForClass(FinancialTransaction);
