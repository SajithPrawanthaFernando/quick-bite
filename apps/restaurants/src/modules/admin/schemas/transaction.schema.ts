// transaction.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import * as mongoose from 'mongoose';

export enum TransactionStatus {
  PENDING = 'pending',
  COMPLETED = 'completed',
  FAILED = 'failed',
  REFUNDED = 'refunded'
}

export enum TransactionType {
  ORDER_PAYMENT = 'order_payment',
  RESTAURANT_PAYOUT = 'restaurant_payout',
  REFUND = 'refund',
  PLATFORM_FEE = 'platform_fee'
}

export enum PaymentMethod {
  CREDIT_CARD = 'credit_card',
  DEBIT_CARD = 'debit_card',
  WALLET = 'wallet',
  CASH = 'cash',
  BANK_TRANSFER = 'bank_transfer'
}

export type TransactionDocument = Transaction & Document;

@Schema()
export class PaymentDetails {
  @Prop()
  transactionId: string;

  @Prop()
  paymentGateway: string;

  @Prop()
  paymentDate: Date;
}

export const PaymentDetailsSchema = SchemaFactory.createForClass(PaymentDetails);

@Schema({ timestamps: true })
export class Transaction {
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Order' })
  orderId?: Types.ObjectId;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Restaurant' })
  restaurantId?: Types.ObjectId;

  @Prop({ required: true })
  amount: number;

  @Prop({ required: true, enum: TransactionStatus, type: String })
  status: TransactionStatus;

  @Prop({ required: true, enum: TransactionType, type: String })
  type: TransactionType;

  @Prop({ required: true, enum: PaymentMethod, type: String })
  paymentMethod: PaymentMethod;

  @Prop({ default: 0 })
  platformFee: number;

  @Prop({ type: PaymentDetailsSchema })
  paymentDetails?: PaymentDetails;

  @Prop()
  receiptNumber: string;

  @Prop()
  transactionId: string;

  @Prop()
  notes: string;

  @Prop({ default: false })
  isRefunded: boolean;

  @Prop()
  refundedAt: Date;

  @Prop()
  refundReason: string;

  @Prop({ type: mongoose.Schema.Types.Mixed })
  metadata: Record<string, any>;

  @Prop({ default: true })
  isActive: boolean;
}

export const TransactionSchema = SchemaFactory.createForClass(Transaction);