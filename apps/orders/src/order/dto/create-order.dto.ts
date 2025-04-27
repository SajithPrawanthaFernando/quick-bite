// src/order/dto/create-order.dto.ts
import { Address } from './address.dto'; // Import Address

export class CreateOrderDto {
    customerId: string;
    items: {
      itemId: string;
      name: string;
      quantity: number;
      price: number;
    }[];
    deliveryAddress: Address; // Update from string to Address object
    deliveryFee: number;
    totalAmount?: number; // Optional but preferred
  }
  