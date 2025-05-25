import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { VotelogDto } from './votelofdto/vote-dto';
import { Votelog } from './entities/votelog.entity';

@Injectable()
export class VotelogService {
  constructor(
    @InjectRepository(Votelog) private votelogRepo: Repository<Votelog>,
  ) {}

  async saveLog(voteLog: VotelogDto) {
    const votelog = this.votelogRepo.create(voteLog);
    return await this.votelogRepo.save(votelog);
  }
}
