import { IsString, IsNotEmpty, IsEnum } from 'class-validator';
import { ServiceType } from '@prisma/client'; // Import the enum type

export class CreateTaskDto {
  @IsString()
  @IsNotEmpty()
  customerName: string; // Use customer name instead of ID

  @IsString()
  @IsNotEmpty()
  siteName: string; // Use site name instead of ID

  @IsString()
  @IsNotEmpty()
  serviceName: string; // Use service name instead of ID

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsString()
  @IsNotEmpty()
  remark: string;

  @IsEnum(ServiceType)
  serviceType: ServiceType;

  @IsString()
  @IsNotEmpty()
  date: string; // Or use Date type if preferred
}
