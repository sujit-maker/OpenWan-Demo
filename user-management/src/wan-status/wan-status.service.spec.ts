import { Test, TestingModule } from '@nestjs/testing';
import { WanStatusService } from './wan-status.service';

describe('WanStatusService', () => {
  let service: WanStatusService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [WanStatusService],
    }).compile();

    service = module.get<WanStatusService>(WanStatusService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
