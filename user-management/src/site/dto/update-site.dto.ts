import { IsString, IsEmail, IsNotEmpty, IsOptional, IsInt } from 'class-validator';

export class UpdateSiteDto {
  @IsOptional()
  customerId?: number; 

  @IsString()
  @IsNotEmpty()
  @IsOptional()
  siteName?: string;

  @IsString()
  @IsNotEmpty()
  @IsOptional()
  siteAddress?: string;

  @IsString()
  @IsNotEmpty()
  @IsOptional()
  contactName?: string;

  @IsString()
  @IsNotEmpty()
  @IsOptional()
  contactNumber?: string;

  @IsEmail()
  @IsOptional()
  contactEmail?: string;

  @IsOptional()
  @IsInt()
  adminId?: number; // Optional field for admin

  @IsOptional()
  @IsInt()
  managerId?: number; // Optional field for manager
}