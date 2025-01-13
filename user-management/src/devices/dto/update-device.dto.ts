// src/devices/dto/update-device.dto.ts

import { ArrayNotEmpty, ArrayUnique, IsArray, IsInt, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class UpdateDeviceDto {

  @IsNotEmpty()
  @IsString()
  deviceId: string;

  @IsOptional()
  @IsString()
  deviceName?: string;

  @IsNotEmpty()
  @IsInt()
  siteId: number;

  @IsOptional()
  @IsString()
  deviceType?: string;

  @IsOptional()
  @IsString()
  deviceIp?: string;

  @IsOptional()
  @IsString()
  devicePort?: string;

  @IsNotEmpty()
  @IsString()
  portCount: string;

   @IsOptional()
  @IsArray()
  @ArrayNotEmpty()
  @ArrayUnique()
  @IsString({ each: true }) // Validates each item in the array as a string
  emailId?: string[];


  @IsOptional()
  @IsString()
  deviceUsername?: string;

  @IsOptional()
  @IsString()
  devicePassword?: string;

  @IsOptional()
  @IsInt()
  adminId?: number; // Optional field for admin

  @IsOptional()
  @IsInt()
  managerId?: number; // Optional field for manager
}
