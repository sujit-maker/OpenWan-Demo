import { Module } from '@nestjs/common';
import { DevicesService } from './devices.service';
import { DevicesController } from './devices.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { MikroTikModule } from 'src/mikrotik/mikroTik.module';
import { PrismaService } from 'src/prisma/prisma.service';
import { MikroTikService } from 'src/mikrotik/mikrotik.service';

@Module({
  imports:[PrismaModule,MikroTikModule],
  providers: [PrismaService,DevicesService,MikroTikService],
  controllers: [DevicesController]
})
export class DevicesModule {}
