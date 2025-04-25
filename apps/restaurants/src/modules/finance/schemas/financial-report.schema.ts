import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { Restaurant } from '../../restaurant/schemas/restaurant.schema';

export type FinancialReportDocument = FinancialReport & Document;

@Schema({ timestamps: true })
export class FinancialReport {
  @Prop({ type: Types.ObjectId, ref: 'Restaurant', required: true })
  restaurant: Types.ObjectId;

  @Prop({ type: Date, required: true })
  startDate: Date;

  @Prop({ type: Date, required: true })
  endDate: Date;

  @Prop({ type: Number, default: 0 })
  totalOrders: number;

  @Prop({ type: Number, default: 0 })
  totalRevenue: number;

  @Prop({ type: Number, default: 0 })
  platformFees: number;

  @Prop({ type: Number, default: 0 })
  restaurantEarnings: number;

  @Prop({ type: Number, default: 0 })
  pendingPayouts: number;

  @Prop({ type: Number, default: 0 })
  completedPayouts: number;

  @Prop({ type: Object })
  breakdown: {
    byDay?: Record<
      string,
      {
        orders: number;
        revenue: number;
        fees: number;
        earnings: number;
      }
    >;
    byPaymentMethod?: Record<
      string,
      {
        orders: number;
        revenue: number;
      }
    >;
  };
}

export const FinancialReportSchema =
  SchemaFactory.createForClass(FinancialReport);
