// dispute.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import * as mongoose from 'mongoose';

export type DisputeDocument = Dispute & Document;

@Schema({ timestamps: true })
export class Dispute {
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: true })
  order: Types.ObjectId;

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Customer',
    required: true,
  })
  customer: Types.ObjectId;

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Restaurant',
    required: true,
  })
  restaurant: Types.ObjectId;

  @Prop({ required: true })
  reason: string;

  @Prop({ required: true })
  description: string;

  @Prop({ type: [String], default: [] })
  evidenceUrls: string[];

  @Prop({
    required: true,
    enum: ['pending', 'in_progress', 'resolved', 'rejected'],
  })
  status: string;

  @Prop({ type: mongoose.Schema.Types.Mixed })
  resolution: Record<string, any>;

  @Prop()
  resolvedAt: Date;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Admin' })
  resolvedBy: Types.ObjectId;

  @Prop()
  notes: string;

  @Prop({ default: true })
  isActive: boolean;
}

export const DisputeSchema = SchemaFactory.createForClass(Dispute);
