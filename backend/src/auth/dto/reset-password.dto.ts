import { IsNotEmpty, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ResetPasswordDto {
  @ApiProperty({
    example: 'abc123def456...',
    description: 'Token de recuperación',
  })
  @IsNotEmpty({ message: 'El token es requerido' })
  @IsString()
  token: string;

  @ApiProperty({
    example: 'nuevaContraseña123',
    description: 'Nueva contraseña (mínimo 6 caracteres)',
  })
  @IsNotEmpty({ message: 'La nueva contraseña es requerida' })
  @MinLength(6, { message: 'La contraseña debe tener al menos 6 caracteres' })
  newPassword: string;
}
