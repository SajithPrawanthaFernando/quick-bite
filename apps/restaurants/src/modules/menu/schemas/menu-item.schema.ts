import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

@Schema({ timestamps: true })
export class MenuItem extends Document {
  @Prop({ required: true })
  name: string;

  @Prop()
  description: string;

  @Prop({ required: true })
  price: number;

  @Prop()
  image: string;

  @Prop()
  category: string;

  @Prop({ default: true })
  isAvailable: boolean;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Restaurant', required: true })
  restaurant: MongooseSchema.Types.ObjectId;
}

export const MenuItemSchema = SchemaFactory.createForClass(MenuItem);
