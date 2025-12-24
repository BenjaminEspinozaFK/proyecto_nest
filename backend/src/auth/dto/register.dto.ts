import {
  IsEmail,
  IsString,
  IsNotEmpty,
  IsOptional,
  MinLength,
  Matches,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RegisterDto {
  @ApiProperty({
    example: 'usuario@test.com',
    description: 'Email del usuario',
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({
    example: 'password123',
    description: 'Contraseña del usuario',
    minLength: 6,
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  password: string;

  @ApiProperty({
    example: 'Juan Pérez',
    description: 'Nombre del usuario',
    required: false,
  })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiProperty({
    example: '12345678-9',
    description: 'RUT del usuario',
    minLength: 8,
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  rut: string;

  @ApiProperty({
    example: '98765432',
    description: 'Teléfono del usuario (8 dígitos, sin +569)',
    required: false,
  })
  @IsString()
  @IsOptional()
  @Matches(/^[0-9]{8}$/, {
    message: 'El teléfono debe tener exactamente 8 dígitos',
  })
  phone?: string;
}
