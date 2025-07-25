import { IsString, IsNumber, MinLength, Min } from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateAdminDto {
  @Transform(({ value }) => value.trim())
  @IsString()
  @MinLength(1)
  name: string;

  @IsNumber()
  @Min(18)
  age: number;
}
