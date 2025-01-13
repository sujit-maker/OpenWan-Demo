import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';

@Injectable()
export class TaskService {
  constructor(private prisma: PrismaService) {}

  async create(createTaskDto: CreateTaskDto) {
    const { customerName, siteName, serviceName, description, date, remark, serviceType } = createTaskDto;

    const customer = await this.prisma.customer.findUnique({ where: { customerName } });
    const site = await this.prisma.site.findFirst({ where: { siteName } }); 
    const service = await this.prisma.service.findUnique({ where: { serviceName } });

    if (!customer || !site || !service) {
      throw new NotFoundException('Invalid customer, site, or service name');
    }

    return this.prisma.task.create({
      data: {
        customer: { connect: { id: customer.id } },
        site: { connect: { id: site.id } },
        service: { connect: { id: service.id } },
        description,
        date: new Date(date),
        remark,
        serviceType,
      },
    });
  }

  // Find all tasks
  async findAll() {
    return this.prisma.task.findMany({
      include: {
        customer: { select: { customerName: true } },
        site: { select: { siteName: true } },
        service: { select: { serviceName: true } },
      },
    });
  }

  // Find one task by ID
  async findOne(id: number) {
    const task = await this.prisma.task.findUnique({
      where: { id },
      include: {
        customer: { select: { customerName: true } },
        site: { select: { siteName: true } },
        service: { select: { serviceName: true } },
      },
    });
    if (!task) {
      throw new NotFoundException(`Task with ID ${id} not found`);
    }
    return task;
  }

  // Update a task
  async update(id: number, updateTaskDto: UpdateTaskDto) {
    const { customerName, siteName, serviceName, description, date, remark, serviceType } = updateTaskDto;

    const taskId = Number(id);
    if (isNaN(taskId)) {
      throw new NotFoundException(`Invalid ID: ${id}`);
    }

    // Check if the task exists
    const task = await this.prisma.task.findUnique({ where: { id: taskId } });
    if (!task) throw new NotFoundException(`Task with ID ${taskId} not found`);

    // Find the updated customer, site, and service if provided
    const customer = customerName ? await this.prisma.customer.findUnique({ where: { customerName } }) : null;
    const site = siteName ? await this.prisma.site.findFirst({ where: { siteName } }) : null; // Use findFirst for non-unique fields
    const service = serviceName ? await this.prisma.service.findUnique({ where: { serviceName } }) : null;

    // If provided, connect them to the task
    return this.prisma.task.update({
      where: { id: taskId },
      data: {
        customer: customer ? { connect: { id: customer.id } } : undefined,
        site: site ? { connect: { id: site.id } } : undefined,
        service: service ? { connect: { id: service.id } } : undefined,
        description: description ?? task.description,
        date: date ? new Date(date) : task.date,
        remark: remark ?? task.remark,
        serviceType: serviceType ?? task.serviceType,
      },
    });
  }

  // Delete a task
  async remove(id: number) {
    // Ensure `id` is a number
    const taskId = Number(id);
    if (isNaN(taskId)) {
      throw new NotFoundException(`Invalid ID: ${id}`);
    }

    // Check if the task exists
    const task = await this.prisma.task.findUnique({ where: { id: taskId } });
    if (!task) throw new NotFoundException(`Task with ID ${taskId} not found`);

    // Delete the task
    return this.prisma.task.delete({ where: { id: taskId } });
  }
}
