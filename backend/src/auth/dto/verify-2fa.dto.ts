import { IsString, IsNotEmpty, Length } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class Verify2faDto {
  @ApiProperty({
    example: '123456',
    description: 'Código TOTP de 6 dígitos de Google Authenticator',
  })
  @IsString()
  @IsNotEmpty()
  @Length(6, 6)
  code: string;
}

export class Login2faDto {
  @ApiProperty({ example: 'usuario@test.com' })
  @IsString()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ example: 'password123' })
  @IsString()
  @IsNotEmpty()
  password: string;

  @ApiProperty({ example: 'user' })
  @IsString()
  @IsNotEmpty()
  role: string;

  @ApiProperty({
    example: '123456',
    description: 'Código TOTP de 6 dígitos',
  })
  @IsString()
  @IsNotEmpty()
  @Length(6, 6)
  code: string;
}
