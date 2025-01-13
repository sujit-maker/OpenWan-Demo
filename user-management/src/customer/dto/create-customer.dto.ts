  import { IsOptional, IsInt } from "class-validator";

  export class CreateCustomerDto {
  customerName: string;
  customerAddress: string;
  gstNumber: string;
  contactName: string;
  contactNumber: string;
  email: string;

  @IsOptional()
  @IsInt()
  adminId?: number;

  @IsOptional()
  @IsInt()
  managerId?: number;

}
