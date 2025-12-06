import {
  IsString,
  IsNumber,
  IsEmail,
  IsNotEmpty,
  MinLength,
  Min,
} from 'class-validator';
import { IsOptional, IsIn } from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateUserDto {
  @IsEmail()
  @IsString()
  @IsNotEmpty()
  email: string;

  @Transform(({ value }) => value.trim())
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  name: string;

  @IsNumber()
  @Min(18)
  age: number;

  @IsOptional()
  @Transform(({ value }) => value?.trim())
  @IsString()
  @MinLength(6)
  password?: string;

  @IsOptional()
  @IsIn(['user', 'admin'])
  role?: 'user' | 'admin';
}
