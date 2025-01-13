import { UserType } from "@prisma/client";
import { IsEnum, IsOptional, IsString } from "class-validator";


export class UpdateUserDto {
  @IsString()
  @IsOptional()
  username?: string;

  @IsString()
  @IsOptional()
  password?: string;

  @IsEnum(UserType)
  @IsOptional()
  usertype?: UserType;

  @IsOptional()
  managerId?: number; 
  adminId: number;

  @IsOptional()
  customerId:number

  @IsOptional()
  siteId:number

  @IsString()
  emailId:string
}
