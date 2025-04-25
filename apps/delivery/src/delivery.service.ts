import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { DeliveryDocument } from "./models/delivery.schema";
import { CreateDeliveryDto } from "./dto/create-delivery.dto";

@Injectable()
export class DeliveryService {
  constructor(
    @InjectModel(DeliveryDocument.name)
    private readonly deliveryModel: Model<DeliveryDocument>, // Directly inject Mongoose model
  ) {}

  async createDelivery(createDeliveryDto: CreateDeliveryDto) {
    const deliveryEntity = {
      _id: new Types.ObjectId(),
      orderId: createDeliveryDto.orderId,
      customerId: createDeliveryDto.customerId,
      driverId: createDeliveryDto.driverId,
      driverName: createDeliveryDto.driverName,
      pickupLocation: createDeliveryDto.pickupLocation,
      deliveryLocation: createDeliveryDto.deliveryLocation,
      status: "picked",
      estimatedDeliveryTime: createDeliveryDto.estimatedDeliveryTime,
      actualDeliveryTime: null,
      deliveryNotes: createDeliveryDto.deliveryNotes ?? "",
    };

    return this.deliveryModel.create(deliveryEntity);
  }
  async getDeliveryById(id: string) {
    return this.deliveryModel.findById(id).exec();
  }

  async updateDeliveryStatus(
    id: string,
    status: "picked" | "in_transit" | "delivered" | "cancelled",
  ) {
    if (!Types.ObjectId.isValid(id)) {
      throw new Error("Invalid delivery ID");
    }

    return this.deliveryModel
      .findByIdAndUpdate(id, { status }, { new: true })
      .exec();
  }

  async getDeliveriesByDriver(driverId: string) {
    return this.deliveryModel.find({ driverId }).sort({ createdAt: -1 }).exec();
  }
}
