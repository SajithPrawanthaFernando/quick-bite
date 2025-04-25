import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { DisputeStatus } from '../enums/dispute-status.enum';

export type DisputeDocument = Dispute & Document;

@Schema()
export class Resolution {
  @Prop({ required: true })
  decision: string;

  @Prop({ required: true })
  resolutionDate: Date;

  @Prop()
  notes?: string;
}

export const ResolutionSchema = SchemaFactory.createForClass(Resolution);

@Schema({ timestamps: true })
export class Dispute {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  customerId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Restaurant', required: true })
  restaurantId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Order', required: true })
  orderId: Types.ObjectId;

  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  description: string;

  @Prop({ type: String, enum: DisputeStatus, default: DisputeStatus.PENDING })
  status: DisputeStatus;

  @Prop({ type: ResolutionSchema })
  resolution?: Resolution;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  resolvedBy?: Types.ObjectId;

  @Prop()
  resolvedAt?: Date;

  @Prop({ default: true })
  isActive: boolean;
}

export const DisputeSchema = SchemaFactory.createForClass(Dispute);
