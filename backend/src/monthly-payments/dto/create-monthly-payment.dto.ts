import { IsString, IsNumber, IsOptional, Min, Max } from 'class-validator';

export class CreateMonthlyPaymentDto {
  @IsString()
  userId: string;

  @IsNumber()
  @Min(2000)
  @Max(2100)
  year: number;

  @IsNumber()
  @Min(1)
  @Max(12)
  month: number; // 1-12

  @IsNumber()
  @Min(0)
  amount: number;

  @IsOptional()
  @IsString()
  description?: string;
}
