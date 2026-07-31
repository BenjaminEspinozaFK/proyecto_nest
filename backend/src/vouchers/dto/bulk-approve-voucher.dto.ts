import {
  IsArray,
  ArrayNotEmpty,
  IsString,
  IsNumber,
  IsPositive,
  IsOptional,
} from 'class-validator';

export class BulkApproveVoucherDto {
  @IsArray()
  @ArrayNotEmpty()
  @IsString({ each: true })
  voucherIds: string[];

  @IsNumber()
  @IsPositive()
  amount: number;

  @IsOptional()
  @IsString()
  notes?: string;
}
