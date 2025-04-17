import {
  IsArray,
  IsEmail,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPhoneNumber,
  IsString,
  IsStrongPassword,
} from 'class-validator';

export class CreateUserDto {
  @IsEmail()
  email: string;

  @IsStrongPassword()
  password: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @IsNotEmpty({ each: true })
  roles?: string[];

  @IsString({ each: true })
  @IsPhoneNumber('LK')
  phone?: string;

  @IsString({ each: true })
  address?: string;

  @IsString({ each: true })
  fullname?: string;

  @IsString({ each: true })
  firstname?: string;

  @IsString({ each: true })
  lastname?: string;
}
