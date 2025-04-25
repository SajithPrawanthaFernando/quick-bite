// src/modules/restaurant/dto/update-restaurant.dto.ts
import { PartialType } from '@nestjs/swagger';
import { CreateRestaurantDto } from './create-restaurant.dto';
import { IsBoolean, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateRestaurantDto extends PartialType(CreateRestaurantDto) {
  @ApiProperty({ required: false })
  @IsBoolean()
  @IsOptional()
  isTemporarilyClosed?: boolean;
}
