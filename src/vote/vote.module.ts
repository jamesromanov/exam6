import { forwardRef, Module } from '@nestjs/common';
import { VoteService } from './vote.service';
import { VoteResolver } from './vote.resolver';

import { UsersModule } from 'src/users/users.module';
import { RedisService } from 'src/redis/redis.service';

import { TypeOrmModule } from '@nestjs/typeorm';
import { VotesModel } from './entities/vote.model';
import { PollsRestModule } from 'src/pollrest/pollrest.module';
import { VotelogModule } from 'src/votelog/votelog.module';

@Module({
  imports: [
    UsersModule,
    TypeOrmModule.forFeature([VotesModel]),
    forwardRef(() => PollsRestModule),
    VotelogModule,
  ],
  providers: [VoteResolver, RedisService, VoteService],
  exports: [VoteService],
})
export class VoteModule {}
