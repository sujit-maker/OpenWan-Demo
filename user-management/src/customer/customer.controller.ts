import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  BadRequestException,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { CustomerService } from './customer.service';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';

@Controller('customers')
export class CustomerController {
  constructor(private readonly customerService: CustomerService) {}

  @Post()
  create(@Body() createCustomerDto: CreateCustomerDto) {
    return this.customerService.create(createCustomerDto);
  }

  @Get()
  async findAll(@Query('adminId') adminId?: string, @Query('managerId') managerId?: string) {
    try {
      if (adminId) {
        const adminIdInt = parseInt(adminId, 10); // Convert to integer
        if (isNaN(adminIdInt)) {
          throw new BadRequestException('adminId must be a valid number');
        }
        return await this.customerService.findByAdminId(adminIdInt); // Fetch customers for a specific admin
      }

      if (managerId) {
        const managerIdInt = parseInt(managerId, 10); // Convert to integer
        if (isNaN(managerIdInt)) {
          throw new BadRequestException('managerId must be a valid number');
        }
        return await this.customerService.findByManagerId(managerIdInt); // Fetch customers for a specific manager
      }

      return await this.customerService.findAll(); // No filters, fetch all customers
    } catch (error) {
      throw new BadRequestException('Failed to fetch customers');
    }
  }


  @Get('manager')
  async countByManagerId(@Query('managerId') managerId: string) {
    const managerIdNumber = parseInt(managerId, 10);
    if (isNaN(managerIdNumber)) {
      throw new BadRequestException('Invalid managerId');
    }
    return this.customerService.countByManagerId(managerIdNumber);
  }


  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.customerService.findOne(+id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateCustomerDto: UpdateCustomerDto,
  ) {
    return this.customerService.update(+id, updateCustomerDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.customerService.remove(+id);
  }
}
