// src/app.module.ts
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { AppController } from './restaurants.controller';
import { AppService } from './restaurants.service';
import { RestaurantModule } from './modules/restaurant/restaurant.module';
import { AdminModule } from './modules/admin/admin.module';
import { CustomerModule } from './customer/customer.module';
import { MenuModule } from './modules/menu/menu.module';
import { FinanceModule } from './modules/finance/finance.module';
import { AvailabilityModule } from './modules/availability/availability.module';
import { RestaurantDashboardModule } from './restaurant-dashboard/restaurant-dashboard.module';
import configuration from './config/configuration';
import { AUTH_SERVICE, DatabaseModule, LoggerModule } from '@app/common';
import { ClientsModule, Transport } from '@nestjs/microservices';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
    }),
    DatabaseModule,
    LoggerModule,
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
    MongooseModule.forRoot(
      process.env.MONGODB_URI ||
        'mongodb://localhost:27017/restaurant-platform',
    ),
    RestaurantModule,
    AdminModule,
    CustomerModule,
    MenuModule,
    FinanceModule,
    AvailabilityModule,
    RestaurantDashboardModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
