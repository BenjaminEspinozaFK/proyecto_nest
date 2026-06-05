import { IsString, MinLength } from 'class-validator';

export class AdminChangePasswordDto {
  @IsString()
  currentPassword!: string;

  @IsString()
  @MinLength(6)
  newPassword!: string;
}
