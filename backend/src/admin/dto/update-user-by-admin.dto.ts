import { Transform } from 'class-transformer';
import {
  IsEmail,
  IsString,
  IsOptional,
  MinLength,
  IsEnum,
  Matches,
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

  @Transform(({ value }) => value?.trim())
  @IsString()
  @IsOptional()
  @Matches(/^[0-9]{8}$/, {
    message: 'El teléfono debe tener exactamente 8 dígitos',
  })
  phone?: string;

  @IsOptional()
  @IsEnum(['user', 'admin'])
  role?: string;
}
