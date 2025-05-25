import { Test, TestingModule } from '@nestjs/testing';
import { VotelogService } from './votelog.service';

describe('VotelogService', () => {
  let service: VotelogService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [VotelogService],
    }).compile();

    service = module.get<VotelogService>(VotelogService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
