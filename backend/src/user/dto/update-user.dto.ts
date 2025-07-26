import { Transform } from 'class-transformer';
import {
  IsEmail,
  IsString,
  IsOptional,
  IsNumber,
  MinLength,
  Min,
  Max,
} from 'class-validator';

export class UpdateUserDto {
  @IsEmail()
  @IsString()
  @IsOptional()
  email?: string;

  @Transform(({ value }) => value.trim())
  @IsString()
  @IsOptional()
  @MinLength(6)
  password?: string;

  @Transform(({ value }) => value.trim())
  @IsString()
  @IsOptional()
  @MinLength(2)
  name?: string;

  @IsNumber()
  @IsOptional()
  @Min(1)
  @Max(120)
  age?: number;
}
