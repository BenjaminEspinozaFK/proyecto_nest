import { Transform } from 'class-transformer';
import { IsEmail, IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class UpdateUserDto {
  @IsEmail()
  @IsString()
  @IsNotEmpty()
  email?: string;

  @Transform(({ value }) => value.trim())
  @IsString()
  @IsNotEmpty()
  password?: string;

  @IsString()
  @IsOptional()
  name?: string;
}
