// services/dto/update-service.dto.ts
import { IsOptional, IsString } from 'class-validator';

export class UpdateServiceDto {


  @IsOptional()
  @IsString()
  serviceName?: string;

  @IsOptional()
  @IsString()
  description?: string;
}
