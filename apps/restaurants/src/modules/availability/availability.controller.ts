import {
  Controller,
  Get,
  Put,
  Param,
  Body,
  UseGuards,
  Request,
  HttpStatus,
  Post,
  Delete,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';

import { AvailabilityService } from './availability.service';
import { UpdateAvailabilityDto } from './dto/update-availability.dto';
import { UpdateSpecialDayDto } from './dto/update-special-day.dto';

@ApiTags('availability')
@Controller('availability')
export class AvailabilityController {
  constructor(private readonly availabilityService: AvailabilityService) {}

  @Get('restaurant/:restaurantId')
  @ApiOperation({ summary: 'Get restaurant availability' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Returns restaurant availability',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Restaurant not found',
  })
  async getRestaurantAvailability(@Param('restaurantId') restaurantId: string) {
    return this.availabilityService.getRestaurantAvailability(restaurantId);
  }

  @Put('restaurant/:restaurantId')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update restaurant availability' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Availability updated successfully',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Not authorized to update this restaurant',
  })
  async updateRestaurantAvailability(
    @Param('restaurantId') restaurantId: string,
    @Body() updateAvailabilityDto: UpdateAvailabilityDto,
    @Request() req,
  ) {
    return this.availabilityService.updateRestaurantAvailability(
      restaurantId,
      updateAvailabilityDto,
      req.user.id,
    );
  }

  @Post('special-day/:restaurantId')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Add or update a special day' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Special day updated successfully',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Not authorized to update this restaurant',
  })
  async updateSpecialDay(
    @Param('restaurantId') restaurantId: string,
    @Body() updateSpecialDayDto: UpdateSpecialDayDto,
    @Request() req,
  ) {
    return this.availabilityService.updateSpecialDay(
      restaurantId,
      updateSpecialDayDto.date,
      updateSpecialDayDto.schedule,
      req.user.id,
    );
  }

  @Delete('special-day/:restaurantId/:date')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Remove a special day' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Special day removed successfully',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Not authorized to update this restaurant',
  })
  async removeSpecialDay(
    @Param('restaurantId') restaurantId: string,
    @Param('date') date: string,
    @Request() req,
  ) {
    return this.availabilityService.removeSpecialDay(
      restaurantId,
      date,
      req.user.id,
    );
  }

  @Get('current-status/:restaurantId')
  @ApiOperation({ summary: 'Get current restaurant open/closed status' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Returns current status' })
  async getCurrentStatus(@Param('restaurantId') restaurantId: string) {
    return this.availabilityService.getCurrentStatus(restaurantId);
  }
}
