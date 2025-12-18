import { IsInt, Min } from 'class-validator';

export class CreateVoucherDto {
  @IsInt()
  @Min(1)
  kilos: number; // 15 o 45 kg
}
