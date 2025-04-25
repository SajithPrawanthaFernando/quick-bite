import { Module } from '@nestjs/common';
import { MongooseModule, getModelToken } from '@nestjs/mongoose';
import { AvailabilityService } from './availability.service';
import { AvailabilityController } from './availability.controller';
import {
  Availability,
  AvailabilitySchema,
} from './schemas/availability.schema';
import {
  Restaurant,
  RestaurantSchema,
} from '../restaurant/schemas/restaurant.schema';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { AUTH_SERVICE } from '@app/common';
import { ConfigService } from '@nestjs/config';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Availability.name, schema: AvailabilitySchema },
      { name: Restaurant.name, schema: RestaurantSchema },
    ]),
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
  controllers: [AvailabilityController],
  providers: [
    {
      provide: AvailabilityService,
      useFactory: (availabilityModel, restaurantModel) => {
        return new AvailabilityService(availabilityModel, restaurantModel);
      },
      inject: [
        getModelToken(Availability.name),
        getModelToken(Restaurant.name),
      ],
    },
  ],
  exports: [AvailabilityService],
})
export class AvailabilityModule {}
