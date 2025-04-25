// src/modules/restaurant/dto/create-restaurant.dto.ts
import { IsString, IsNotEmpty, IsOptional, IsNumber, IsArray } from 'class-validator';
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

  @ApiProperty({ example: 40.7128, description: 'Latitude coordinate' })
  @IsNumber()
  @IsNotEmpty()
  latitude: number;

  @ApiProperty({ example: -74.0060, description: 'Longitude coordinate' })
  @IsNumber()
  @IsNotEmpty()
  longitude: number;
}
