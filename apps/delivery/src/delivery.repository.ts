import { Injectable, Logger } from '@nestjs/common';
import { AbstractRepository } from '@app/common';
import { DeliveryDocument } from './models/delivery.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

@Injectable()
export class DeliveryRepository extends AbstractRepository<DeliveryDocument> {
  protected readonly logger = new Logger(DeliveryRepository.name);

  constructor(
    @InjectModel(DeliveryDocument.name)
    deliveryModel: Model<DeliveryDocument>,
  ) {
    super(deliveryModel);
  }
}
