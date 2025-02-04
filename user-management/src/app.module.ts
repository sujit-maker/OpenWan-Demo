import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './user/user.module';
import { PrismaService } from './prisma/prisma.service';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { CustomerModule } from './customer/customer.module';
import { SiteModule } from './site/site.module';
import { DevicesModule } from './devices/devices.module';
import { EmailModule } from './email/email.module';
import { MikroTikModule } from './mikrotik/mikroTik.module';
import { WanStatusService } from './wan-status/wan-status.service';
import { WanStatusController } from './wan-status/wan-status.controller';
import { WanStatusModule } from './wan-status/wan-status.module';
import { ScheduleModule } from '@nestjs/schedule';  // Import the ScheduleModule
import { TicketsModule } from './tickets/tickets.module';



@Module({
  imports: [    ScheduleModule.forRoot(), // Enable scheduling
    AuthModule,UserModule,PrismaModule,CustomerModule, SiteModule,DevicesModule, EmailModule,MikroTikModule, WanStatusModule, TicketsModule],
  controllers: [AppController, WanStatusController],
  providers: [AppService, PrismaService, WanStatusService],
})
export class AppModule {}
