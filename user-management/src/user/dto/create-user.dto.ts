import { IsEnum, IsInt, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { UserType } from '@prisma/client';

export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  username: string;

  @IsString()
  @IsNotEmpty()
  password: string;

  @IsEnum(UserType)
  @IsNotEmpty()
  usertype: UserType;

  @IsOptional()
  managerId?: number;

  @IsOptional()   
  adminId?: number;

  @IsOptional()
  @IsInt()
  customerId:number

  @IsOptional()
  @IsInt()
  siteId:number

  @IsString()
  emailId:string


}
