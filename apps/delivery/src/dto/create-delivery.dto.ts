import {
  IsDefined,
  IsNotEmpty,
  IsString,
  IsObject,
  IsOptional,
  IsDateString,
} from 'class-validator';

class LocationDto {
  @IsDefined()
  @IsNotEmpty()
  @IsString()
  address: string;

  @IsDefined()
  latitude: number;

  @IsDefined()
  longitude: number;
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
  driverId: string;

  @IsDefined()
  @IsNotEmpty()
  @IsString()
  driverName: string;

  @IsDefined()
  @IsObject()
  pickupLocation: LocationDto;

  @IsDefined()
  @IsObject()
  deliveryLocation: LocationDto;

  @IsOptional()
  @IsDateString()
  estimatedDeliveryTime?: string;

  @IsOptional()
  @IsString()
  deliveryNotes?: string;
}
