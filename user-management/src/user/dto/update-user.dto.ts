import { UserType } from "@prisma/client";
import { IsEnum, IsOptional, IsString } from "class-validator";


export class UpdateUserDto {
  @IsString()
  @IsOptional()
  username?: string;

  @IsString()
  @IsOptional()
  password?: string;
}
