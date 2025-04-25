import { Module } from '@nestjs/common';
import { RestaurantDashboardGateway } from './restaurant-dashboard.gateway';
import { OrderModule } from '../modules/order/order.module';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    OrderModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get('JWT_SECRET'),
        signOptions: { expiresIn: '24h' },
      }),
    }),
  ],
  providers: [RestaurantDashboardGateway],
})
export class RestaurantDashboardModule {}
