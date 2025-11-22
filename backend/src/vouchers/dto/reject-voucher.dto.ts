import { IsOptional, IsString } from 'class-validator';

export class RejectVoucherDto {
  @IsOptional()
  @IsString()
  notes?: string; // Razón del rechazo
}
