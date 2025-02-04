import { Controller, Get, Post, Body, Patch, Param, Delete, Put } from '@nestjs/common';
import { TicketsService } from './tickets.service';
import { CreateTicketDto, UpdateTicketDto } from './dto/ticket.dto';

@Controller('tickets')
export class TicketsController {
  constructor(private readonly ticketsService: TicketsService) {}

  @Post()
  async create(@Body() createTicketDto: CreateTicketDto) {
    return this.ticketsService.create(createTicketDto);
  }

  @Get()
  async findAll() {
    return this.ticketsService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.ticketsService.findOne(+id);
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() updateTicketDto: UpdateTicketDto) {
    return this.ticketsService.update(+id, updateTicketDto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.ticketsService.remove(+id);
  }

  @Get('fetch/:userId')
  async fetchTickets(@Param('userId') userId: string) {
    const userIdParsed = parseInt(userId, 10); // Make sure it's a number
    if (isNaN(userIdParsed)) {
      throw new Error('Invalid userId provided');
    }
    return this.ticketsService.getTicketsByUserId(userIdParsed);
  }
}
