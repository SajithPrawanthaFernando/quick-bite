import {
  IsDefined,
  IsNotEmpty,
  IsString,
  IsObject,
  IsOptional,
  IsDateString,
  IsNumber,
  IsEnum,
} from 'class-validator';

class DeliveryLocationDto {
  @IsDefined()
  @IsNotEmpty()
  @IsString()
  houseNumber: string;

  @IsDefined()
  @IsNotEmpty()
  @IsString()
  lane1: string;

  @IsOptional()
  @IsString()
  lane2?: string;

  @IsDefined()
  @IsNotEmpty()
  @IsString()
  city: string;

  @IsDefined()
  @IsNotEmpty()
  @IsString()
  district: string;
}

export class CreateDeliveryDto {
  @IsDefined()
  @IsNotEmpty()
  @IsString()
  orderId: string;

  @IsDefined()
  @IsNotEmpty()
  @IsString()
  customerId: string;

  @IsDefined()
  @IsNotEmpty()
  @IsString()
  customerName: string;

  @IsDefined()
  @IsNotEmpty()
  @IsString()
  customerPhone: string;

  @IsOptional()
  @IsNumber()
  totalAmount?: number;

  @IsDefined()
  @IsNotEmpty()
  @IsString()
  driverId: string;

  @IsDefined()
  @IsNotEmpty()
  @IsString()
  driverName: string;

  @IsDefined()
  @IsNotEmpty()
  @IsString()
  driverPhone: string;

  @IsDefined()
  @IsNotEmpty()
  @IsString()
  pickupLocation: string;

  @IsDefined()
  @IsObject()
  deliveryLocation: DeliveryLocationDto;

  @IsOptional()
  @IsEnum(['driver_assigned', 'picked', 'in_transit', 'delivered', 'cancelled'])
  status?: string = 'driver_assigned';

  @IsOptional()
  @IsDateString()
  estimatedDeliveryTime?: string;

  @IsOptional()
  @IsDateString()
  actualDeliveryTime?: string;

  @IsOptional()
  @IsString()
  deliveryNotes?: string;
}