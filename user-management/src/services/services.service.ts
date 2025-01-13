import { Injectable, NotFoundException } from "@nestjs/common";
import { UpdateServiceDto } from "./dto/update-service.dto";
import { Service } from "@prisma/client";
import { CreateServiceDto } from "./dto/create-service.dto";
import { PrismaService } from "src/prisma/prisma.service";

@Injectable()
export class ServicesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createServiceDto: CreateServiceDto): Promise<Service> {
    const lastService = await this.prisma.service.findFirst({
      orderBy: {
        id: 'desc', 
      },
    });

    let newServiceId = 'ENPL-SR-01'; 

    if (lastService && lastService.serviceId) {
      try {
        const lastServiceNumber = parseInt(lastService.serviceId.split('-').pop() || '0', 10);
        
        const nextServiceNumber = lastServiceNumber + 1;
        newServiceId = `ENPL-SR-${String(nextServiceNumber).padStart(2, '0')}`;
      } catch (error) {
        console.error('Error generating new service ID:', error);
        throw new Error('Failed to generate service ID');
      }
    }

    return this.prisma.service.create({
      data: {
        serviceId: newServiceId, 
        serviceName: createServiceDto.serviceName,
        description: createServiceDto.description,
      },
    });
  }

  async findAll(): Promise<Service[]> {
    return this.prisma.service.findMany();
  }

  async findOne(id: number): Promise<Service | null> {
    return this.prisma.service.findUnique({
      where: { id },
    });
  }

  async update(id: number, updateServiceDto: UpdateServiceDto): Promise<Service> {
    // Ensure the id is a number
    return this.prisma.service.update({
      where: { id: Number(id) }, // Convert id to number here
      data: updateServiceDto,
    });
  }
  

  async remove(id: number) {
    const service = await this.prisma.service.findUnique({ where: { id } });

    if (!service) {
      throw new NotFoundException(`Service with ID ${id} not found`);
    }

    await this.prisma.service.delete({ where: { id } });
    return { message: `Service with ID ${id} deleted successfully` };
  }
}
