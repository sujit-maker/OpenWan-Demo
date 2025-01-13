import { IsString, IsEmail, IsNotEmpty, IsOptional, IsInt } from 'class-validator';

export class CreateSiteDto {
  @IsNotEmpty()
  customerId: number; 

  @IsString()
  @IsNotEmpty()
  siteName: string;

  @IsString()
  @IsNotEmpty()
  siteAddress: string;

  @IsString()
  @IsNotEmpty()
  contactName: string;

  @IsString()
  @IsNotEmpty()
  contactNumber: string;

  @IsEmail()
  contactEmail: string;

  @IsOptional()
  @IsInt()
  adminId?: number; // Optional field for admin

  @IsOptional()
  @IsInt()
  managerId?: number; // Optional field for manager
}
