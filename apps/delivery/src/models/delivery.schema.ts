import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { AbstractDocument } from '@app/common';

@Schema({ versionKey: false, timestamps: true })
export class DeliveryDocument extends AbstractDocument {
  @Prop({ required: true })
  orderId: string;

  @Prop({ required: true })
  customerId: string;

  @Prop({ required: true })
  driverId: string;

  @Prop({ required: true })
  driverName: string;

  @Prop({ type: Object, required: true })
  pickupLocation: {
    address: string;
    latitude: number;
    longitude: number;
  };

  @Prop({ type: Object, required: true })
  deliveryLocation: {
    address: string;
    latitude: number;
    longitude: number;
  };

  @Prop({ enum: ['picked', 'in_transit', 'delivered', 'cancelled'], default: 'picked' })
  status: string;

  @Prop()
  estimatedDeliveryTime?: Date;

  @Prop()
  actualDeliveryTime?: Date;

  @Prop()
  deliveryNotes?: string;
}

export const DeliverySchema = SchemaFactory.createForClass(DeliveryDocument);
