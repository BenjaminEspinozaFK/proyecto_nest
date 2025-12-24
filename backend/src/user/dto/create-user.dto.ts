import { Transform } from 'class-transformer';
import {
  IsEmail,
  IsNotEmpty,
  IsString,
  IsOptional,
  MinLength,
  Matches,
} from 'class-validator';

export class CreateUserDto {
  @IsEmail()
  @IsString()
  @IsNotEmpty()
  email: string;

  @Transform(({ value }) => value.trim())
  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  password: string;

  @Transform(({ value }) => value.trim())
  @IsString()
  @IsOptional()
  @MinLength(2)
  name?: string;

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
}
