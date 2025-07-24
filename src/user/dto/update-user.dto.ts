import { Transform } from 'class-transformer';
import {
  IsEmail,
  IsString,
  IsNotEmpty,
  IsOptional,
  MinLength,
} from 'class-validator';

export class UpdateUserDto {
  @IsEmail()
  @IsString()
  @IsNotEmpty()
  email?: string;

  @Transform(({ value }) => value.trim())
  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  password?: string;

  @IsString()
  @IsOptional()
  @MinLength(2)
  name?: string;
}
