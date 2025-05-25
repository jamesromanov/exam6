import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from 'src/users/users.module';
import { PollrestController } from './pollrest.controller';
import { PollrestService } from './pollrest.service';
import { PollRestModel } from './entities/pollrest.entity';
import { RedisService } from 'src/redis/redis.service';
import { VoteModule } from 'src/vote/vote.module';

@Module({
  imports: [
    UsersModule,
    TypeOrmModule.forFeature([PollRestModel]),
    forwardRef(() => VoteModule),
  ],
  controllers: [PollrestController],
  providers: [PollrestService, RedisService],
  exports: [PollrestService],
})
export class PollsRestModule {}
