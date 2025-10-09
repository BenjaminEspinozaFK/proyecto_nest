import { IsEmail, IsNotEmpty, IsString, IsIn } from 'class-validator';

export class LoginDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsNotEmpty()
  @IsString()
  password: string;

  @IsNotEmpty()
  @IsString()
  @IsIn(['user', 'admin']) // Validar que sea 'user' o 'admin'
  role: string;
}
