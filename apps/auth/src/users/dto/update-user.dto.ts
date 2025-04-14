import { IsArray, IsOptional, IsString } from 'class-validator';

export class UpdateUserDto {
  @IsOptional()
  @IsString()
  email?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  roles?: string[];
}
