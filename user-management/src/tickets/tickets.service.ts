import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTicketDto, UpdateTicketDto } from './dto/ticket.dto';
import { Ticket } from '@prisma/client';


@Injectable()
export class TicketsService {
  constructor(private prisma: PrismaService) {}

  async create(createTicketDto: CreateTicketDto) {
    // Fetch the last ticket from the database
    const lastTicket = await this.prisma.ticket.findFirst({
      orderBy: { id: 'desc' },
    });

    // Generate the new ticketNo
    const lastNumber = lastTicket
      ? parseInt(lastTicket.ticketNo.split('-').pop()) || 0
      : 0;
    const newTicketNo = `ENPL-TKT-${(lastNumber + 1).toString().padStart(2, '0')}`;

    // Create the new ticket
    const ticket = await this.prisma.ticket.create({
      data: {
        ...createTicketDto,
        ticketNo: newTicketNo,
      },
    });

    return ticket;
  }

  async findAll() {
    return this.prisma.ticket.findMany();
  }

  async findOne(id: number) {
    return this.prisma.ticket.findUnique({ where: { id } });
  }

  async update(id: number, updateTicketDto: UpdateTicketDto) {
    return this.prisma.ticket.update({
      where: { id },
      data: updateTicketDto,
    });
  }

  async remove(id: number) {
    return this.prisma.ticket.delete({ where: { id } });
  }

  async getTicketsByUserId(userId: number): Promise<Ticket[]> {
    return this.prisma.ticket.findMany({
      where: {
        userId: userId, // This filters tickets based on the userId
      },
    });
  }
}
