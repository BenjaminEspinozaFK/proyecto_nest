import { IsInt, IsIn, IsOptional, IsString } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateVoucherDto {
  // El multipart/form-data siempre envía los campos como texto, y transform
  // no hace conversión implícita de tipos globalmente, así que se coerce
  // explícitamente a número aquí (no afecta a las requests JSON normales).
  @Type(() => Number)
  @IsInt()
  @IsIn([5, 11, 15, 45], {
    message: 'Los kilos deben ser 5, 11, 15 o 45',
  })
  kilos: number; // 5, 11, 15 o 45 kg

  @IsOptional()
  @IsString()
  bank?: string; // Banco con el que pagará
}
