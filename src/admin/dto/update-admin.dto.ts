import {
  IsString,
  IsNumber,
  IsEmail,
  IsOptional,
  MinLength,
  Min,
} from 'class-validator';
import { Transform } from 'class-transformer';

export class UpdateAdminDto {
  @IsEmail()
  @IsString()
  @IsOptional()
  email?: string;

  @Transform(({ value }) => value.trim())
  @IsString()
  @IsOptional()
  @MinLength(2)
  name?: string;

  @IsNumber()
  @IsOptional()
  @Min(18)
  age?: number;

  @Transform(({ value }) => value.trim())
  @IsString()
  @IsOptional()
  @MinLength(6)
  password?: string;
}
