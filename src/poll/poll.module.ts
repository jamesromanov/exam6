import { Module } from '@nestjs/common';
import { PollService } from './poll.service';
import { PollResolver } from './poll.resolver';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PollModel } from './entities/poll.model';

import { UsersModule } from 'src/users/users.module';
import { RedisService } from 'src/redis/redis.service';

@Module({
  imports: [UsersModule, TypeOrmModule.forFeature([PollModel])],
  providers: [PollResolver, PollService, RedisService],
})
export class PollModule {}
