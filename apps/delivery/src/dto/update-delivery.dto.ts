import { IsIn, IsDefined } from 'class-validator';

export class UpdateDeliveryStatusDto {
  @IsDefined()
  @IsIn(['picked', 'in_transit', 'delivered', 'cancelled'])
  status: 'picked' | 'in_transit' | 'delivered' | 'cancelled';
}