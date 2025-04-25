import {
  IsString,
  IsNotEmpty,
  ValidateNested,
  IsBoolean,
  IsArray,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

class TimeSlotDto {
  @ApiProperty()
  @IsString()
  open: string;

  @ApiProperty()
  @IsString()
  close: string;
}

class DailyScheduleInputDto {
  @ApiProperty()
  @IsBoolean()
  isOpen: boolean;

  @ApiProperty({ type: [TimeSlotDto] })
  @ValidateNested({ each: true })
  @Type(() => TimeSlotDto)
  @IsArray()
  slots: TimeSlotDto[];
}

export class UpdateSpecialDayDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  date: string;

  @ApiProperty()
  @ValidateNested()
  @Type(() => DailyScheduleInputDto)
  schedule: DailyScheduleInputDto;
}
