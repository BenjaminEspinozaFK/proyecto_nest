import { IsNumber, IsPositive, IsOptional, IsString } from 'class-validator';

export class ApproveVoucherDto {
  @IsNumber()
  @IsPositive()
  amount: number; // Monto en pesos

  @IsOptional()
  @IsString()
  notes?: string;
}
