import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';

@Injectable()
export class CustomerService {
  constructor(private prisma: PrismaService) {}


  async findByAdminId(adminId: number) {
    try {
      const customers = await this.prisma.customer.findMany({
        where: { adminId: adminId }, 
      });
      return customers;
    } catch (error) {
      console.error('Error fetching customers:', error); // Log any errors
      throw new BadRequestException('Failed to fetch customers');
    }
  }

  async findByManagerId(managerId: number) {
    try {
      const customers = await this.prisma.customer.findMany({
        where: { managerId: managerId }, // Expect managerId to be an integer
      });
      return customers;
    } catch (error) {
      console.error('Error fetching customers:', error); // Log any errors
      throw new BadRequestException('Failed to fetch customers');
    }
  }

  async countByManagerId(managerId: number) {
    try {
      const count = await this.prisma.customer.count({
        where: { managerId },
      });
      return { managerId, count };
    } catch (error) {
      console.error(`Error counting customers for managerId ${managerId}:`, error);
      throw new BadRequestException('Failed to fetch customer count');
    }
  }
  

  async create(data: CreateCustomerDto) {
    try {
      const customerData = {
        ...data,
        contactNumber: data.contactNumber.toString(),
      };

      if (!data.adminId) {
        delete customerData.adminId;
      }

      if (!data.managerId) {
        delete customerData.managerId;
      }

      return await this.prisma.customer.create({
        data: customerData,
      });
    } catch (error) {
      console.error('Error creating customer:', error);
      throw new BadRequestException('Failed to create customer');
    }
  }

 

  // Modify the findAll method to filter customers by adminId
  async findAll(adminId?: number) {
    try {
      if (adminId) {
        return await this.prisma.customer.findMany({
          where: { adminId },
        });
      } else {
        return await this.prisma.customer.findMany();
      }
    } catch (error) {
      throw new BadRequestException('Failed to fetch customers');
    }
  }

  async findOne(id: number) {
    try {
      const customer = await this.prisma.customer.findUnique({ where: { id } });
      if (!customer) {
        throw new NotFoundException(`Customer with ID ${id} not found`);
      }
      return customer;
    } catch (error) {
      throw new NotFoundException(`Failed to fetch customer with ID ${id}`);
    }
  }

  async update(id: number, data: UpdateCustomerDto) {
    try {
      const customer = await this.prisma.customer.findUnique({ where: { id } });
      if (!customer) {
        throw new NotFoundException(`Customer with ID ${id} not found`);
      }

      return await this.prisma.customer.update({
        where: { id },
        data: {
          ...data,
          contactNumber: data.contactNumber?.toString(),
        },
      });
    } catch (error) {
      throw new BadRequestException('Failed to update customer');
    }
  }

  async remove(id: number) {
    try {
      const customer = await this.prisma.customer.findUnique({ where: { id } });
      if (!customer) {
        throw new NotFoundException(`Customer with ID ${id} not found`);
      }
      return await this.prisma.customer.delete({ where: { id } });
    } catch (error) {
      throw new BadRequestException('Failed to delete customer');
    }
  }
}
