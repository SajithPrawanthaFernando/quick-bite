import { IsObject, IsOptional, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

class TimeSlotDto {
  @ApiProperty({ example: '09:00' })
  open: string;

  @ApiProperty({ example: '20:00' })
  close: string;
}

class DailyScheduleDto {
  @ApiProperty({ example: true })
  isOpen: boolean;

  @ApiProperty({ type: [TimeSlotDto] })
  @ValidateNested({ each: true })
  @Type(() => TimeSlotDto)
  slots: TimeSlotDto[];
}

export class UpdateAvailabilityDto {
  @ApiProperty({
    example: {
      monday: { isOpen: true, slots: [{ open: '09:00', close: '20:00' }] },
      // other days...
    },
    required: false,
  })
  @IsObject()
  @IsOptional()
  @ValidateNested()
  regularHours?: Record<string, DailyScheduleDto>;

  @ApiProperty({
    example: {
      '2024-12-25': { isOpen: false, slots: [] },
      '2025-01-01': { isOpen: false, slots: [] },
    },
    required: false,
  })
  @IsObject()
  @IsOptional()
  @ValidateNested()
  specialDays?: Record<string, DailyScheduleDto>;
}
