import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';

import {
  Restaurant,
  RestaurantSchema,
} from '../restaurant/schemas/restaurant.schema';
import { Transaction, TransactionSchema } from './schemas/transaction.schema';
import { Dispute, DisputeSchema } from '../dispute/schemas/dispute.schema';
import { DatabaseModule, LoggerModule, AUTH_SERVICE } from '@app/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Restaurant.name, schema: RestaurantSchema },
      { name: Transaction.name, schema: TransactionSchema },
      { name: Dispute.name, schema: DisputeSchema },
    ]),
    DatabaseModule,
    LoggerModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: { expiresIn: '1d' },
      }),
      inject: [ConfigService],
    }),
    ConfigModule,
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
  controllers: [AdminController],
  providers: [AdminService],
  exports: [AdminService],
})
export class AdminModule {}
