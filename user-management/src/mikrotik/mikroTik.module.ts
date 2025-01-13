// mikroTik.module.ts
import { Module } from '@nestjs/common';
import { MikroTikService } from './mikroTik.service';

@Module({
  providers: [MikroTikService],
  exports: [MikroTikService], 
})
export class MikroTikModule {}
