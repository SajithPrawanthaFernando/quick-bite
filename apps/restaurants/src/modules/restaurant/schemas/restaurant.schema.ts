import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type RestaurantDocument = Restaurant & Document;

@Schema({ timestamps: true })
export class Restaurant {
  @Prop({ required: true })
  name: string;

  @Prop()
  description: string;

  @Prop({ required: true })
  address: string;

  @Prop({ required: true })
  phone: string;

  @Prop()
  logo: string;

  @Prop()
  cuisineType: string;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  owner: Types.ObjectId;

  @Prop({ default: false })
  isApproved: boolean;

  @Prop({ default: true })
  isActive: boolean;

  @Prop({ default: false })
  isTemporarilyClosed: boolean;

  @Prop()
  verificationNotes: string;

  @Prop()
  rejectionReason: string;

  @Prop({
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point',
    },
    coordinates: {
      type: [Number],
      required: true,
    },
  })
  location: {
    type: string;
    coordinates: number[];
  };

  @Prop({ required: true })
  latitude: number;

  @Prop({ required: true })
  longitude: number;
}

export const RestaurantSchema = SchemaFactory.createForClass(Restaurant);

// Create a 2dsphere index for geospatial queries
RestaurantSchema.index({ location: '2dsphere' });

// src/modules/restaurant/dto/create-restaurant.dto.ts
import { IsString, IsNotEmpty, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateRestaurantDto {
  @ApiProperty({ example: 'Delicious Restaurant' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'Serving the best food in town', required: false })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ example: '123 Main St, City, Country' })
  @IsString()
  @IsNotEmpty()
  address: string;

  @ApiProperty({ example: '+1234567890' })
  @IsString()
  @IsNotEmpty()
  phone: string;

  @ApiProperty({ example: 'Italian', required: false })
  @IsString()
  @IsOptional()
  cuisineType?: string;

  @ApiProperty({ example: 'https://example.com/logo.jpg', required: false })
  @IsString()
  @IsOptional()
  logo?: string;
}
