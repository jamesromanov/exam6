import { Module } from '@nestjs/common';
import { VotelogService } from './votelog.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Votelog } from './entities/votelog.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Votelog])],
  providers: [VotelogService],
  exports: [TypeOrmModule.forFeature([Votelog]), VotelogService],
})
export class VotelogModule {}
