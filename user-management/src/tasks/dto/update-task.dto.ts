import { IsEnum, IsOptional, IsString, IsDateString } from 'class-validator';
import { ServiceType } from '@prisma/client';

export class UpdateTaskDto {
  @IsOptional()
  @IsString()
  customerName?: string;

  @IsOptional()
  @IsString()
  siteName?: string;

  @IsOptional()
  @IsString()
  serviceName?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsDateString()
  date?: string;

  @IsOptional()
  @IsString()
  remark?: string;

  @IsOptional()
  @IsEnum(ServiceType)
  serviceType?: ServiceType;
}
