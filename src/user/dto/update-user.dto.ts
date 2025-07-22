import { IsEmail, IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class UpdateUserDto {
  @IsEmail()
  @IsString()
  @IsNotEmpty()
  email?: string;

  @IsString()
  @IsNotEmpty()
  password?: string;

  @IsString()
  @IsOptional()
  name?: string;
}
