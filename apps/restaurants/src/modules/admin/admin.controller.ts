import {
  Controller,
  Get,
  Post,
  Put,
  Patch,
  Param,
  Body,
  Query,
  UseGuards,
  Req,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { AdminService } from './admin.service';
import { DisputeStatus } from '../dispute/enums/dispute-status.enum';
import { JwtAuthGuard, Roles } from '@app/common';
import { RolesGuard } from '@app/common/auth/roles.guard';

@ApiTags('admin')
@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Patch('users/:id/suspend')
  @ApiOperation({ summary: 'Suspend user account' })
  @ApiResponse({ status: 200, description: 'User account suspended' })
  // Restaurant Verification
  @Get('restaurants/pending')
  @ApiOperation({ summary: 'Get pending restaurant verifications' })
  @ApiResponse({
    status: 200,
    description: 'Returns list of pending restaurants',
  })
  async getPendingVerifications(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
  ) {
    return this.adminService.getPendingVerifications(page, limit);
  }

  @Get('restaurants')
  @ApiOperation({ summary: 'Get all restaurants' })
  @ApiResponse({ status: 200, description: 'Returns list of all restaurants' })
  async getAllRestaurants(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
  ) {
    return this.adminService.getAllRestaurants(page, limit);
  }

  @Post('restaurants/:id/verify')
  @ApiOperation({ summary: 'Verify restaurant registration' })
  @ApiResponse({
    status: 200,
    description: 'Restaurant verification processed',
  })
  async verifyRestaurant(
    @Param('id') restaurantId: string,
    @Body('approved') approved: boolean,
    @Body('notes') notes?: string,
  ) {
    return await this.adminService.verifyRestaurant(
      restaurantId,
      approved,
      notes,
    );
  }

  @Patch('restaurants/:id/verification')
  @ApiOperation({ summary: 'Update pending restaurant verification' })
  @ApiResponse({
    status: 200,
    description: 'Restaurant verification updated successfully',
  })
  @ApiResponse({ status: 404, description: 'Restaurant not found' })
  @ApiResponse({ status: 400, description: 'Restaurant is already approved' })
  async updatePendingVerification(
    @Param('id') restaurantId: string,
    @Body()
    updateData: {
      isApproved?: boolean;
      verificationNotes?: string;
      rejectionReason?: string;
    },
  ) {
    return await this.adminService.updatePendingVerification(
      restaurantId,
      updateData,
    );
  }

  // Financial Management
  @Get('transactions')
  @ApiOperation({ summary: 'Get all transactions' })
  @ApiResponse({ status: 200, description: 'Returns list of transactions' })
  async getTransactions(
    @Req() req: any,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
    @Query() filters: any,
  ) {
    try {
      return await this.adminService.getTransactions(
        page,
        limit,
        filters,
        req.user.id,
      );
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.FORBIDDEN);
    }
  }

  @Post('restaurants/:id/payout')
  @ApiOperation({ summary: 'Process restaurant payout' })
  @ApiResponse({ status: 201, description: 'Payout processed successfully' })
  async processRestaurantPayout(
    @Param('id') restaurantId: string,
    @Body('amount') amount: number,
    @Req() req: any,
  ) {
    try {
      return await this.adminService.processRestaurantPayout(
        restaurantId,
        amount,
        req.user.id,
      );
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.FORBIDDEN);
    }
  }

  // Dispute Management
  @Get('disputes')
  @ApiOperation({ summary: 'Get all disputes' })
  @ApiResponse({ status: 200, description: 'Returns list of disputes' })
  async getDisputes(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
    @Query('status') status?: string,
  ) {
    return this.adminService.getDisputes(page, limit, status);
  }

  @Post('disputes/:id/resolve')
  @ApiOperation({ summary: 'Resolve dispute' })
  @ApiResponse({ status: 200, description: 'Dispute resolved successfully' })
  async resolveDispute(
    @Param('id') disputeId: string,
    @Body() resolution: any,
    @Req() req: any,
  ) {
    try {
      return await this.adminService.resolveDispute(
        disputeId,
        req.user.id,
        resolution,
      );
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.FORBIDDEN);
    }
  }

  // Financial Reports
  @Get('reports/financial')
  @ApiOperation({ summary: 'Generate financial report' })
  @ApiResponse({ status: 200, description: 'Returns financial report' })
  async generateFinancialReport(
    @Req() req: any,
    @Query('startDate') startDate: Date,
    @Query('endDate') endDate: Date,
  ) {
    try {
      return await this.adminService.generateFinancialReport(
        startDate,
        endDate,
        req.user.id,
      );
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.FORBIDDEN);
    }
  }
}
