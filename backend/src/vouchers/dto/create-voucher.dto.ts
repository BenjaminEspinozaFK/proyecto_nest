import { IsInt, IsIn, IsOptional, IsString } from 'class-validator';

export class CreateVoucherDto {
  @IsInt()
  @IsIn([5, 11, 15, 45], {
    message: 'Los kilos deben ser 5, 11, 15 o 45',
  })
  kilos: number; // 5, 11, 15 o 45 kg

  @IsOptional()
  @IsString()
  bank?: string; // Banco con el que pagará
}
