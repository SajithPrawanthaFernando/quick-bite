import {
  Controller,
  Get,
  Post,
  Put,
  Patch,
  Param,
  Body,
  Query,
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

@ApiTags('admin')
@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  // User Account Management
  @Get('users')
  @ApiOperation({ summary: 'Get all users' })
  @ApiResponse({ status: 200, description: 'Returns list of users' })
  async getAllUsers(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
    @Query('role') role?: string,
  ) {
    return this.adminService.getAllUsers(page, limit, role);
  }

  // @Patch('users/:id/suspend')
  // @ApiOperation({ summary: 'Suspend user account' })
  // @ApiResponse({ status: 200, description: 'User account suspended' })
  // async suspendUser(
  //   @Param('id') userId: string,
  //   @Body('reason') reason: string,
  //   @Req() req: any,
  // ) {
  //   try {
  //     return await this.adminService.suspendUser(userId, reason, req.user.id);
  //   } catch (error) {
  //     throw new HttpException(error.message, HttpStatus.FORBIDDEN);
  //   }
  // }

  // @Patch('users/:id/reactivate')
  // @ApiOperation({ summary: 'Reactivate user account' })
  // @ApiResponse({ status: 200, description: 'User account reactivated' })
  // async reactivateUser(@Param('id') userId: string, @Req() req: any) {
  //   try {
  //     return await this.adminService.reactivateUser(userId, req.user.id);
  //   } catch (error) {
  //     throw new HttpException(error.message, HttpStatus.FORBIDDEN);
  //   }
  // }

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

  @Post('restaurants/:id/verify')
  @ApiOperation({ summary: 'Verify restaurant registration' })
  @ApiResponse({
    status: 200,
    description: 'Restaurant verification processed',
  })
  async verifyRestaurant(
    @Param('id') restaurantId: string,
    @Body('approved') approved: boolean,
    @Req() req: any,
    @Body('notes') notes?: string,
  ) {
    try {
      return await this.adminService.verifyRestaurant(
        restaurantId,
        approved,
        req.user.id,
        notes,
      );
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.FORBIDDEN);
    }
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
    @Req() req: any,
  ) {
    try {
      return await this.adminService.updatePendingVerification(
        restaurantId,
        req.user.id,
        updateData,
      );
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.FORBIDDEN);
    }
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
