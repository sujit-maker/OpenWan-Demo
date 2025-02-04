import { IsString, IsOptional, IsInt } from 'class-validator';

export class CreateTicketDto {


  @IsString()
  category: string;

  @IsString()
  subject: string;

  @IsString()
  query: string;
 
  @IsString()
  status: string;

  @IsOptional()
  @IsInt()
  userId?: number;

  @IsString({ each: true }) // Ensure each remark is a string
  @IsOptional()
  remark?: string[]; // This remains an array of strings
}

export class UpdateTicketDto {

  @IsOptional()
  @IsString()
  category?: string;

  @IsOptional()
  @IsString()
  subject?: string;

  @IsOptional()
  @IsString()
  query?: string;

  @IsString()
  status: string;

  @IsOptional()
  @IsInt()
  userId?: number;

  @IsString({ each: true }) // Ensure each remark is a string
  @IsOptional()
  remark?: string[]; // This remains an array of strings
}
