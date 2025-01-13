import { IsNotEmpty, IsString, IsInt, IsIP, IsOptional, ArrayNotEmpty, ArrayUnique, IsArray } from 'class-validator';

export class CreateDeviceDto {

  @IsNotEmpty()
  @IsString()
  deviceId: string;

  @IsNotEmpty()
  @IsString()
  deviceName: string;

  @IsNotEmpty()
  @IsInt()
  siteId: number;

  @IsNotEmpty()
  @IsString()
  deviceType: string;

  @IsNotEmpty()
  @IsString()
  deviceIp: string;

  @IsNotEmpty()
  @IsString()
  devicePort: string;

  @IsNotEmpty()
  @IsString()
  portCount: string;

  @IsOptional()
  @IsArray()
  @ArrayNotEmpty()
  @ArrayUnique()
  @IsString({ each: true }) 
  emailId?: string[];

  @IsNotEmpty()
  @IsString()
  deviceUsername: string;

  @IsNotEmpty()
  @IsString()
  devicePassword: string;
  
  @IsOptional()
  @IsInt()
  adminId?: number; 

  @IsOptional()
  @IsInt()
  managerId?: number; 
}
