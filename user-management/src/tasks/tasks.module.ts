import { Module } from '@nestjs/common';
import { TaskController } from './tasks.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { TaskService } from './tasks.service';

@Module({
  imports: [PrismaModule],
  providers: [TaskService],
  controllers: [TaskController]
})
export class TasksModule {}
