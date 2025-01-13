import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './user/user.module';
import { PrismaService } from './prisma/prisma.service';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { ServicesModule } from './services/services.module';
import { CustomerModule } from './customer/customer.module';
import { SiteModule } from './site/site.module';
import { TasksModule } from './tasks/tasks.module';
import { DevicesModule } from './devices/devices.module';
import { EmailModule } from './email/email.module';
import { MikroTikModule } from './mikrotik/mikroTik.module';
import { WanStatusService } from './wan-status/wan-status.service';
import { WanStatusController } from './wan-status/wan-status.controller';
import { WanStatusModule } from './wan-status/wan-status.module';
import { ScheduleModule } from '@nestjs/schedule';  // Import the ScheduleModule



@Module({
  imports: [    ScheduleModule.forRoot(), // Enable scheduling
    AuthModule,UserModule,PrismaModule, ServicesModule,CustomerModule, SiteModule,TasksModule, DevicesModule, EmailModule,MikroTikModule, WanStatusModule],
  controllers: [AppController, WanStatusController],
  providers: [AppService, PrismaService, WanStatusService],
})
export class AppModule {}
