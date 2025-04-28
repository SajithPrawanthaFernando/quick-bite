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
      customerName: createDeliveryDto.customerName,
      customerPhone: createDeliveryDto.customerPhone,
      totalAmount: createDeliveryDto.totalAmount || 0,
      driverId: createDeliveryDto.driverId,
      driverName: createDeliveryDto.driverName,
      driverPhone: createDeliveryDto.driverPhone,
      pickupLocation: createDeliveryDto.pickupLocation,
      deliveryLocation: {
        houseNumber: createDeliveryDto.deliveryLocation.houseNumber,
        lane1: createDeliveryDto.deliveryLocation.lane1,
        ...(createDeliveryDto.deliveryLocation.lane2 && {
          lane2: createDeliveryDto.deliveryLocation.lane2,
        }),
        city: createDeliveryDto.deliveryLocation.city,
        district: createDeliveryDto.deliveryLocation.district,
      },
      status: createDeliveryDto.status || "driver_assigned",
      estimatedDeliveryTime: createDeliveryDto.estimatedDeliveryTime
        ? new Date(createDeliveryDto.estimatedDeliveryTime)
        : null,
      actualDeliveryTime: null,
      deliveryNotes: createDeliveryDto.deliveryNotes || "",
      createdAt: new Date(),
      updatedAt: new Date(),
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
    return this.deliveryModel
      .find({ driverId, status: { $ne: "delivered" } })
      .sort({ createdAt: -1 })
      .exec();
  }
  async getDeliveriesByUser(customerId: string) {
    return this.deliveryModel
      .find({ customerId, status: { $ne: "delivered" } })
      .sort({ createdAt: -1 })
      .exec();
  }
  async getDeliveriesByDriverDelivered(driverId: string) {
    
    return this.deliveryModel
      .find({ driverId, status: "delivered"  })
      .sort({ createdAt: -1 })
      .exec();
  }
}
