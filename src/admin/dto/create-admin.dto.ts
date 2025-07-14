import { IsString, IsNumber, MinLength, Min } from 'class-validator';

export class CreateAdminDto {
  @IsString()
  @MinLength(1)
  name: string;

  @IsNumber()
  @Min(18)
  age: number;
}
