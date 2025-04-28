import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from "@nestjs/common";
import { DeliveryService } from "./delivery.service";
import { CurrentUser, JwtAuthGuard, Roles, UserDto } from "@app/common";
import { RolesGuard } from "@app/common/auth/roles.guard";
import { CreateDeliveryDto } from "./dto/create-delivery.dto";
import { UpdateDeliveryStatusDto } from "./dto/update-delivery.dto";

@Controller("deliveries")
export class DeliveryController {
  constructor(private readonly deliveryService: DeliveryService) {}

  @Get(":id")
  @UseGuards(JwtAuthGuard)
  async get(@Param("id") id: string) {
    return this.deliveryService.getDeliveryById(id);
  }
  
  @Get(":id/by-driver-ongoing")
  @UseGuards(JwtAuthGuard)
  async getDeliveriesByDriver(@Param("id") id: string) {
    return this.deliveryService.getDeliveriesByDriver(id);
  }
  @Get(":id/by-user-ongoing")
  @UseGuards(JwtAuthGuard)
  async getDeliveriesByUser(@Param("id") id: string) {
    return this.deliveryService.getDeliveriesByUser(id);
  }
  @Get(":id/by-driver-delivered")
  @UseGuards(JwtAuthGuard)
  async getDeliveriesByDriverDelivered(@Param("id") id: string) {
    return this.deliveryService.getDeliveriesByDriverDelivered(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  async create(@Body() createDeliveryDto: CreateDeliveryDto) {
    return this.deliveryService.createDelivery(createDeliveryDto);
  }

  @Patch(":id/status")
  @UseGuards(JwtAuthGuard)
  async updateStatus(
    @Param("id") id: string,
    @Body() updateStatusDto: UpdateDeliveryStatusDto,
  ) {
    return this.deliveryService.updateDeliveryStatus(
      id,
      updateStatusDto.status,
    );
  }
}
