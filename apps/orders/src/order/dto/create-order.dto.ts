// src/order/dto/create-order.dto.ts
import { IsDefined, ValidateNested } from 'class-validator';
import { Address } from './address.dto'; // Import Address
import { Type } from 'class-transformer';
import { CreateChargeDto } from '@app/common';

export class CreateOrderDto {
  customerId: string;
  restuarantId: string;
  items: {
    itemId: string;
    name: string;
    quantity: number;
    price: number;
  }[];
  deliveryAddress: Address; // Update from string to Address object
  deliveryFee: number;
  totalAmount?: number; // Optional but preferred

  @IsDefined()
  @ValidateNested()
  @Type(() => CreateChargeDto)
  charge: CreateChargeDto;
}
