import {
  IsString,
  IsNotEmpty,
  IsArray,
  ValidateNested,
  IsNumber,
  Min,
  IsOptional,
  IsDefined,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { CreateChargeDto } from '@app/common';

export class OrderItemDto {
  @ApiProperty({ example: '507f1f77bcf86cd799439011' })
  @IsString()
  @IsNotEmpty()
  menuItemId: string;

  @ApiProperty({ example: 2 })
  @IsNumber()
  @Min(1)
  quantity: number;

  @ApiProperty({ example: 'No onions, extra spicy', required: false })
  @IsString()
  @IsOptional()
  specialInstructions?: string;
}

export class CreateOrderDto {
  @ApiProperty({ example: '507f1f77bcf86cd799439011' })
  @IsString()
  @IsNotEmpty()
  restaurantId: string;

  @ApiProperty({ type: [OrderItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OrderItemDto)
  items: OrderItemDto[];

  @ApiProperty({ example: '123 Main St', required: false })
  @IsString()
  @IsOptional()
  deliveryAddress?: string;

  @ApiProperty({ example: 'Leave at the door', required: false })
  @IsString()
  @IsOptional()
  specialInstructions?: string;
}

// src/common/enums/order-status.enum.ts
export enum OrderStatus {
  RECEIVED = 'received',
  ACCEPTED = 'accepted',
  REJECTED = 'rejected',
  PREPARING = 'preparing',
  READY_FOR_PICKUP = 'ready_for_pickup',
  COMPLETED = 'completed',
}
