import { Transform } from 'class-transformer';
import {
  IsEmail,
  IsString,
  IsOptional,
  IsNumber,
  MinLength,
  Min,
  Max,
  IsEnum,
} from 'class-validator';

export class UpdateUserByAdminDto {
  @IsEmail()
  @IsString()
  @IsOptional()
  email?: string;

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

  @IsOptional()
  @IsEnum(['user', 'admin'])
  role?: string;
}
