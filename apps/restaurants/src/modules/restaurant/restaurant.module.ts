// restaurant.module.ts
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { RestaurantController } from './restaurant.controller';
import { RestaurantService } from './restaurant.service';
import { Restaurant, RestaurantSchema } from './schemas/restaurant.schema';
import { MenuModule } from '../menu/menu.module';
import { AUTH_SERVICE } from '@app/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { ConfigService } from '@nestjs/config';
@Module({
  imports: [
    MongooseModule.forFeature([
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
         }]),
    
    MenuModule
  ],
  controllers: [RestaurantController],
  providers: [RestaurantService],
  exports: [RestaurantService]
})
export class RestaurantModule {}
