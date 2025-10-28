import { IsEmail, IsNotEmpty, IsIn } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ForgotPasswordDto {
  @ApiProperty({
    example: 'usuario@example.com',
    description: 'Email del usuario',
  })
  @IsEmail({}, { message: 'Email inválido' })
  @IsNotEmpty({ message: 'El email es requerido' })
  email: string;

  @ApiProperty({
    example: 'user',
    description: 'Tipo de cuenta',
    enum: ['user', 'admin'],
  })
  @IsNotEmpty({ message: 'El rol es requerido' })
  @IsIn(['user', 'admin'], { message: 'Rol debe ser user o admin' })
  role: 'user' | 'admin';
}
