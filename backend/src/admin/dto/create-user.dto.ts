import {
  IsString,
  IsEmail,
  IsNotEmpty,
  MinLength,
  Matches,
} from 'class-validator';
import { IsOptional, IsIn } from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateUserDto {
  @IsEmail()
  @IsString()
  @IsNotEmpty()
  email: string;

  @Transform(({ value }) => value.trim())
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  name: string;

  @Transform(({ value }) => value.trim())
  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  rut: string;

  @Transform(({ value }) => value?.trim())
  @IsString()
  @IsOptional()
  @Matches(/^[0-9]{8}$/, {
    message: 'El teléfono debe tener exactamente 8 dígitos',
  })
  phone?: string;

  @Transform(({ value }) => value?.trim())
  @IsString()
  @IsOptional()
  banco?: string;

  @IsOptional()
  @Transform(({ value }) => value?.trim())
  @IsString()
  @MinLength(6)
  password?: string;

  @IsOptional()
  @IsIn(['user', 'admin'])
  role?: 'user' | 'admin';
}
