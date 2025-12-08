import { IsString, IsEmail, IsOptional, MinLength } from 'class-validator';
import { Transform } from 'class-transformer';

export class UpdateAdminDto {
  @IsEmail()
  @IsString()
  @IsOptional()
  email?: string;

  @Transform(({ value }) => value.trim())
  @IsString()
  @IsOptional()
  @MinLength(2, { message: 'El nombre debe tener al menos 2 caracteres' })
  name?: string;

  @Transform(({ value }) => value.trim())
  @IsString()
  @IsOptional()
  @MinLength(6)
  password?: string;
}
