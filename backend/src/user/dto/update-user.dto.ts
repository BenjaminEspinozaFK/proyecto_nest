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
  @MinLength(2, { message: 'El nombre debe tener al menos 2 caracteres' })
  name?: string;

  @IsNumber()
  @IsOptional()
  @Min(10)
  @Max(120)
  age?: number;
}
