import { IsEnum, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { OrderStatus } from './create-order.dto';

export class UpdateOrderStatusDto {
  @ApiProperty({
    enum: OrderStatus,
    example: OrderStatus.ACCEPTED,
  })
  @IsEnum(OrderStatus)
  status: OrderStatus;

  @ApiProperty({
    example: '15 minutes',
    required: false,
  })
  @IsString()
  @IsOptional()
  estimatedPreparationTime?: string;

  @ApiProperty({
    example: 'Restaurant is closed',
    required: false,
  })
  @IsString()
  @IsOptional()
  rejectionReason?: string;
}
