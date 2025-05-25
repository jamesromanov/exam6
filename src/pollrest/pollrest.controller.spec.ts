import { Test, TestingModule } from '@nestjs/testing';
import { PollrestController } from './pollrest.controller';
import { PollrestService } from './pollrest.service';

describe('PollrestController', () => {
  let controller: PollrestController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PollrestController],
      providers: [PollrestService],
    }).compile();

    controller = module.get<PollrestController>(PollrestController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
