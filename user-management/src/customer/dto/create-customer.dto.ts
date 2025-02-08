import { IsOptional, IsInt, ArrayNotEmpty, ArrayUnique, IsArray, IsString } from "class-validator";

export class CreateCustomerDto {
  customerName: string;
  customerAddress: string;
  gstNumber: string;
  contactName: string;
  contactNumber: string;

  @IsOptional()
  @IsArray()
  @ArrayNotEmpty()
  @ArrayUnique()
  @IsString({ each: true })
  email?: string[];

  @IsOptional()
  @IsInt()
  adminId?: number;

  @IsOptional()
  @IsInt()
  managerId?: number;

}
