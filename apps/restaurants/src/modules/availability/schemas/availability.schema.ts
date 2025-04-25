// src/modules/availability/schemas/availability.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

export class TimeSlot {
  @Prop({ required: true })
  open: string; // Format: "HH:MM" (24-hour)

  @Prop({ required: true })
  close: string; // Format: "HH:MM" (24-hour)
}

export class DailySchedule {
  @Prop({ type: Boolean, default: true })
  isOpen: boolean;

  @Prop({ type: [TimeSlot], default: [] })
  slots: TimeSlot[];
}

@Schema({ timestamps: true })
export class Availability extends Document {
  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: 'Restaurant',
    required: true,
    unique: true,
  })
  restaurant: MongooseSchema.Types.ObjectId;

  @Prop({
    type: Object,
    default: () => ({
      monday: { isOpen: true, slots: [{ open: '09:00', close: '20:00' }] },
      tuesday: { isOpen: true, slots: [{ open: '09:00', close: '20:00' }] },
      wednesday: { isOpen: true, slots: [{ open: '09:00', close: '20:00' }] },
      thursday: { isOpen: true, slots: [{ open: '09:00', close: '20:00' }] },
      friday: { isOpen: true, slots: [{ open: '09:00', close: '20:00' }] },
      saturday: { isOpen: true, slots: [{ open: '10:00', close: '22:00' }] },
      sunday: { isOpen: true, slots: [{ open: '10:00', close: '20:00' }] },
    }),
  })
  regularHours: Record<string, DailySchedule>;

  @Prop({ type: Object, default: {} })
  specialDays: Record<string, DailySchedule>; // Format: "YYYY-MM-DD"
}

export const AvailabilitySchema = SchemaFactory.createForClass(Availability);
