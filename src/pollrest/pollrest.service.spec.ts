import { Test, TestingModule } from '@nestjs/testing';
import { PollrestService } from './pollrest.service';

describe('PollrestService', () => {
  let service: PollrestService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PollrestService],
    }).compile();

    service = module.get<PollrestService>(PollrestService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
