import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { FinanceService } from './finance.service';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '@app/common';
import { RolesGuard } from '@app/common/auth/roles.guard';

@ApiTags('finance')
@Controller('finance')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class FinanceController {
  constructor(private readonly financeService: FinanceService) {}
/*
  @Get('restaurant/:restaurantId/report')
  @ApiOperation({ summary: 'Generate financial report for a restaurant' })
  @ApiResponse({ status: 200, description: 'Returns the financial report' })
  async generateFinancialReport(
    @Param('restaurantId') restaurantId: string,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    return this.financeService.generateFinancialReport(
      restaurantId,
      new Date(startDate),
      new Date(endDate),
    );
  }
    */
/*
  @Post('restaurant/:restaurantId/payout')
  @ApiOperation({ summary: 'Initiate a payout for a restaurant' })
  @ApiResponse({ status: 201, description: 'Payout initiated successfully' })
  async initiateRestaurantPayout(
    @Param('restaurantId') restaurantId: string,
    @Body('amount') amount: number,
  ) {
    return this.financeService.initiateRestaurantPayout(restaurantId, amount);
  }
    */
/*
  @Post('payout/:payoutId/complete')
  @ApiOperation({ summary: 'Complete a restaurant payout' })
  @ApiResponse({ status: 200, description: 'Payout completed successfully' })
  async completeRestaurantPayout(@Param('payoutId') payoutId: string) {
    return this.financeService.completeRestaurantPayout(payoutId);
  }
*/
  @Get('restaurant/:restaurantId/transactions')
  @ApiOperation({ summary: 'Get transaction history for a restaurant' })
  @ApiResponse({ status: 200, description: 'Returns transaction history' })
  async getRestaurantTransactions(
    @Param('restaurantId') restaurantId: string,
    @Query('page') page = 1,
    @Query('limit') limit = 10,
  ) {
    return this.financeService.getRestaurantTransactions(
      restaurantId,
      page,
      limit,
    );
  }
}
