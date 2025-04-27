import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  UseGuards,
  Query,
} from '@nestjs/common';
import { CustomerService } from './customer.service';
import { Customer } from './schemas/customer.schema';
import {
  ApiBearerAuth,
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { JwtAuthGuard, Roles } from '@app/common';

@ApiTags('Customer')
@Controller('customer')
export class CustomerController {
  constructor(private readonly customerService: CustomerService) {}

  @UseGuards(JwtAuthGuard)
  @Get('restaurants')
  @ApiOperation({ summary: 'Get all approved restaurants' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiResponse({
    status: 200,
    description: 'Returns a list of approved restaurants',
  })
  async getApprovedRestaurants(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
  ) {
    return this.customerService.getApprovedRestaurants(page, limit);
  }

  @Get('restaurants/:id/menu')
  @ApiOperation({ summary: 'Get menu for a specific restaurant' })
  @ApiParam({ name: 'id', description: 'Restaurant ID' })
  @ApiResponse({
    status: 200,
    description: 'Returns the restaurant menu grouped by categories',
  })
  @ApiResponse({
    status: 404,
    description: 'Restaurant not found or not available',
  })
  async getRestaurantMenu(@Param('id') restaurantId: string) {
    return this.customerService.getRestaurantMenu(restaurantId);
  }
}
