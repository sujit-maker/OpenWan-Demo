// mikroTik.module.ts
import { Module } from '@nestjs/common';
import { MikroTikService } from './mikroTik.service';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
  imports:[PrismaModule],
 providers: [MikroTikService],
  exports: [MikroTikService], 
})
export class MikroTikModule {}
