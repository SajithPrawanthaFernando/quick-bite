import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { FinanceController } from './finance.controller';
import { FinanceService } from './finance.service';
import {
  FinancialTransaction,
  FinancialTransactionSchema,
} from './schemas/financial-transaction.schema';
import {
  FinancialReport,
  FinancialReportSchema,
} from './schemas/financial-report.schema';
import { Order, OrderSchema } from '../order/schemas/order.schema';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { AUTH_SERVICE } from '@app/common';
import { ConfigService } from '@nestjs/config';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: FinancialTransaction.name, schema: FinancialTransactionSchema },
      { name: FinancialReport.name, schema: FinancialReportSchema },
      { name: Order.name, schema: OrderSchema },
    ]),
    EventEmitterModule.forRoot(),
    ClientsModule.registerAsync([
      {
        name: AUTH_SERVICE,
        useFactory: (configService: ConfigService) => ({
          transport: Transport.TCP,
          options: {
            host: configService.get('AUTH_HOST'),
            port: configService.get('AUTH_PORT'),
          },
        }),
        inject: [ConfigService],
      },
    ]),
  ],
  controllers: [FinanceController],
  providers: [FinanceService],
  exports: [FinanceService],
})
export class FinanceModule {}
