import { Module } from '@nestjs/common';
import { WanStatusController } from './wan-status.controller';
import { WanStatusService } from './wan-status.service';
import { PrismaModule } from 'src/prisma/prisma.module';
import { EmailModule } from 'src/email/email.module';

@Module({
    imports: [PrismaModule,EmailModule],  
    controllers: [WanStatusController],  
    providers: [WanStatusService],  
   })
  
  export class WanStatusModule {}
