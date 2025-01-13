import { Test, TestingModule } from '@nestjs/testing';
import { WanStatusController } from './wan-status.controller';

describe('WanStatusController', () => {
  let controller: WanStatusController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [WanStatusController],
    }).compile();

    controller = module.get<WanStatusController>(WanStatusController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
