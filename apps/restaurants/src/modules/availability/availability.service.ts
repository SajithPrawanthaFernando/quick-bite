import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { Model, Types } from 'mongoose';
import { Availability, DailySchedule } from './schemas/availability.schema';
import { Restaurant } from '../restaurant/schemas/restaurant.schema';
import { UpdateAvailabilityDto } from './dto/update-availability.dto';

@Injectable()
export class AvailabilityService {
  private availabilityModel: Model<Availability>;
  private restaurantModel: Model<Restaurant>;

  constructor(
    availabilityModel: Model<Availability>,
    restaurantModel: Model<Restaurant>,
  ) {
    this.availabilityModel = availabilityModel;
    this.restaurantModel = restaurantModel;
  }

  async getRestaurantAvailability(restaurantId: string) {
    // Check if restaurant exists
    const restaurant = await this.restaurantModel.findById(restaurantId).exec();
    if (!restaurant) {
      throw new NotFoundException(`Restaurant with ID ${restaurantId} not found`);
    }

    // Find or create availability record
    let availability = await this.availabilityModel
      .findOne({ restaurant: { $eq: Types.ObjectId.createFromHexString(restaurantId) } as any })
      .exec();
    
    if (!availability) {
      availability = await this.createDefaultAvailability(restaurantId);
    }

    return availability;
  }

  async updateRestaurantAvailability(
    restaurantId: string, 
    updateAvailabilityDto: UpdateAvailabilityDto, 
    userId: string
  ) {
    // Verify restaurant exists and belongs to user
    const restaurant = await this.restaurantModel.findById(restaurantId).exec();
    if (!restaurant) {
      throw new NotFoundException(`Restaurant with ID ${restaurantId} not found`);
    }

    if (restaurant.owner.toString() !== userId) {
      throw new ForbiddenException('You do not have permission to update this restaurant');
    }

    // Find or create availability document
    let availability = await this.availabilityModel
      .findOne({ restaurant: { $eq: Types.ObjectId.createFromHexString(restaurantId) } as any })
      .exec();
    if (!availability) {
      availability = await this.createDefaultAvailability(restaurantId);
    }

    // Update availability
    availability.regularHours = (updateAvailabilityDto.regularHours || {}) as Record<string, DailySchedule>;
    return availability.save();
  }

  async updateSpecialDay(
    restaurantId: string, 
    date: string, 
    schedule: any, 
    userId: string
  ) {
    // Verify restaurant exists and belongs to user
    const restaurant = await this.restaurantModel.findById(restaurantId).exec();
    if (!restaurant) {
      throw new NotFoundException(`Restaurant with ID ${restaurantId} not found`);
    }

    if (restaurant.owner.toString() !== userId) {
      throw new ForbiddenException('You do not have permission to update this restaurant');
    }

    // Find or create availability document
    let availability = await this.availabilityModel
      .findOne({ restaurant: { $eq: Types.ObjectId.createFromHexString(restaurantId) } as any })
      .exec();
    if (!availability) {
      availability = await this.createDefaultAvailability(restaurantId);
    }

    // Update special day
    availability.specialDays[date] = schedule;
    return availability.save();
  }

  async removeSpecialDay(restaurantId: string, date: string, userId: string) {
    // Verify restaurant exists and belongs to user
    const restaurant = await this.restaurantModel.findById(restaurantId).exec();
    if (!restaurant) {
      throw new NotFoundException(`Restaurant with ID ${restaurantId} not found`);
    }

    if (restaurant.owner.toString() !== userId) {
      throw new ForbiddenException('You do not have permission to update this restaurant');
    }

    // Find availability document
    const availability = await this.availabilityModel
      .findOne({ restaurant: { $eq: Types.ObjectId.createFromHexString(restaurantId) } as any })
      .exec();
    if (!availability) {
      throw new NotFoundException('Availability record not found');
    }

    // Remove special day
    delete availability.specialDays[date];
    return availability.save();
  }

  async getCurrentStatus(restaurantId: string) {
    const availability = await this.availabilityModel
      .findOne({ restaurant: { $eq: Types.ObjectId.createFromHexString(restaurantId) } as any })
      .exec();
    if (!availability) {
      throw new NotFoundException('Availability record not found');
    }

    const now = new Date();
    const dayOfWeek = now.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
    const currentTime = now.toTimeString().slice(0, 5); // Format: "HH:MM"

    // Check special days first
    const dateStr = now.toISOString().split('T')[0]; // Format: "YYYY-MM-DD"
    if (availability.specialDays[dateStr]) {
      const specialDay = availability.specialDays[dateStr];
      if (!specialDay.isOpen) {
        return {
          isOpen: false,
          nextOpeningTime: this.getNextOpeningTime(availability, now)
        };
      }

      const nextSlot = this.getNextOpenSlot(specialDay.slots, currentTime);
      if (nextSlot) {
        return {
          isOpen: true,
          nextSlot
        };
      }

      return {
        isOpen: false,
        nextOpeningTime: this.getNextOpeningTime(availability, now)
      };
    }

    // Check regular hours
    const regularDay = availability.regularHours[dayOfWeek];
    if (!regularDay.isOpen) {
      return {
        isOpen: false,
        nextOpeningTime: this.getNextOpeningTime(availability, now)
      };
    }

    const nextSlot = this.getNextOpenSlot(regularDay.slots, currentTime);
    if (nextSlot) {
      return {
        isOpen: true,
        nextSlot
      };
    }

    return {
      isOpen: false,
      nextOpeningTime: this.getNextOpeningTime(availability, now)
    };
  }

  private async createDefaultAvailability(restaurantId: string) {
    const availability = new this.availabilityModel({
      restaurant: Types.ObjectId.createFromHexString(restaurantId),
      regularHours: {
        monday: { isOpen: true, slots: [{ open: '09:00', close: '20:00' }] },
        tuesday: { isOpen: true, slots: [{ open: '09:00', close: '20:00' }] },
        wednesday: { isOpen: true, slots: [{ open: '09:00', close: '20:00' }] },
        thursday: { isOpen: true, slots: [{ open: '09:00', close: '20:00' }] },
        friday: { isOpen: true, slots: [{ open: '09:00', close: '20:00' }] },
        saturday: { isOpen: true, slots: [{ open: '10:00', close: '22:00' }] },
        sunday: { isOpen: true, slots: [{ open: '10:00', close: '20:00' }] },
      },
      specialDays: {}
    });

    return availability.save();
  }

  private getNextOpenSlot(slots: any[], currentTime: string): string | null {
    for (const slot of slots) {
      if (currentTime >= slot.open && currentTime < slot.close) {
        return slot.close;
      }
    }
    return null;
  }

  private getNextOpeningTime(availability: any, now: Date): string | null {
    const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const currentDay = now.getDay();
    const currentTime = now.toTimeString().slice(0, 5);

    // Check today's remaining slots
    const today = days[currentDay];
    const todaySchedule = availability.regularHours[today];
    if (todaySchedule.isOpen) {
      for (const slot of todaySchedule.slots) {
        if (currentTime < slot.open) {
          return slot.open;
        }
      }
    }

    // Check next days
    for (let i = 1; i <= 7; i++) {
      const nextDay = days[(currentDay + i) % 7];
      const nextDaySchedule = availability.regularHours[nextDay];
      if (nextDaySchedule.isOpen && nextDaySchedule.slots.length > 0) {
        return nextDaySchedule.slots[0].open;
      }
    }

    return null;
  }
}
