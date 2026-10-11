/* eslint-disable @typescript-eslint/no-unsafe-call */
import { IsEnum, IsOptional, IsString, IsNotEmpty } from 'class-validator';

export class UpdatePropertyStatusDto {
  @IsString()
  @IsNotEmpty()
  id!: string;
  @IsEnum(['APPROVED', 'REJECTED'])
  status!: 'APPROVED' | 'REJECTED';
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  rejectionReason?: string;
}
