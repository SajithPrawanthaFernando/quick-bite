import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { AbstractDocument } from '@app/common';

@Schema({ versionKey: false, timestamps: true })
export class DeliveryDocument extends AbstractDocument {
  @Prop({ required: true })
  orderId: string;

  @Prop({ required: true })
  customerId: string;

  @Prop({ required: true })
  customerName: string;

  @Prop({ required: true })
  customerPhone: string;

  @Prop()
  totalAmount: number;

  @Prop({ required: true })
  driverId: string;

  @Prop({ required: true })
  driverName: string;

  @Prop({ required: true })
  driverPhone: string;

  @Prop({ required: true })
  pickupLocation: string;
  
  @Prop({ type: Object, required: true })
  deliveryLocation: {
    houseNumber: string;
    lane1: string;
    lane2?: string; 
    city: string;
    district: string;
  };

  @Prop({ enum: ['driver_assigned','picked', 'in_transit', 'delivered', 'cancelled'], default: 'driver_assigned' })
  status: string;

  @Prop()
  estimatedDeliveryTime?: Date;

  @Prop()
  actualDeliveryTime?: Date;

  @Prop()
  deliveryNotes?: string;
}

export const DeliverySchema = SchemaFactory.createForClass(DeliveryDocument);
