import { IsInt, IsPositive, Min } from 'class-validator';

export class CreateVoucherDto {
  @IsInt()
  @IsPositive()
  @Min(1)
  kilos: number; // 15 o 45 kg
}
