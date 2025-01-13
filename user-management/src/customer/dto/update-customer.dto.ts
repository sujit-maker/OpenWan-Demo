import { IsOptional, IsInt } from "class-validator";

// src/customer/dto/update-customer.dto.ts
export class UpdateCustomerDto {
    customerName?: string;
    customerAddress?: string;
    gstNumber?: string;
    contactName?: string;
    contactNumber?: string;
    email?: string;
    @IsOptional()
    @IsInt()
    adminId?: number;
  
    @IsOptional()
    @IsInt()
    managerId?: number;
  }
  