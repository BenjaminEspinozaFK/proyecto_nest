import { IsString, IsNumber, IsOptional, Min } from 'class-validator';

export class CreateManualVoucherDto {
  @IsString()
  userId: string;

  @IsNumber()
  @Min(1)
  kilos: number;

  @IsNumber()
  @Min(0)
  amount: number;

  @IsOptional()
  @IsString()
  notes?: string;
}
