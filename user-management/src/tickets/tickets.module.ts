import { Module } from '@nestjs/common';
import { TicketsController } from './tickets.controller';
import { TicketsService } from './tickets.service';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
    imports:[PrismaModule],
  controllers: [TicketsController],
  providers: [TicketsService]
})
export class TicketsModule {}
