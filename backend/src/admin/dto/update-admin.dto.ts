import {
  IsString,
  IsNumber,
  IsEmail,
  IsOptional,
  MinLength,
  Min,
} from 'class-validator';
import { Transform } from 'class-transformer';

export class UpdateAdminDto {
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
  @Min(18, { message: 'La edad debe ser mayor o igual a 18 años' })
  age?: number;

  @Transform(({ value }) => value.trim())
  @IsString()
  @IsOptional()
  @MinLength(6)
  password?: string;
}
