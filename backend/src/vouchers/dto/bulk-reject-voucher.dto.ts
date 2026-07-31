import { IsArray, ArrayNotEmpty, IsString, IsOptional } from 'class-validator';

export class BulkRejectVoucherDto {
  @IsArray()
  @ArrayNotEmpty()
  @IsString({ each: true })
  voucherIds: string[];

  @IsOptional()
  @IsString()
  notes?: string;
}
