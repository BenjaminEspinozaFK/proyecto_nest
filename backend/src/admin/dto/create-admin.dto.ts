import {
  IsString,
  IsNumber,
  IsEmail,
  IsNotEmpty,
  IsOptional,
  MinLength,
  Min,
} from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateAdminDto {
  @IsEmail()
  @IsString()
  @IsNotEmpty()
  email: string;

  @Transform(({ value }) => value.trim())
  @IsString()
  @IsOptional()
  @MinLength(2)
  name?: string;

  @IsNumber()
  @Min(18)
  age: number;

  @Transform(({ value }) => value.trim())
  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  password: string;
}
