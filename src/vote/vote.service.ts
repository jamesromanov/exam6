import {
  BadRequestException,
  forwardRef,
  Inject,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { CreateVoteInput } from './dto/create-vote.input';
import { UpdateVoteInput } from './dto/update-vote.input';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { UsersService } from 'src/users/users.service';
import { RedisService } from 'src/redis/redis.service';
import { Request } from 'express';
import { VotesModel } from './entities/vote.model';
import { PollrestService } from 'src/pollrest/pollrest.service';
import { VotelogService } from 'src/votelog/votelog.service';
import { LogStatus } from 'src/votelog/entities/votelog.entity';

@Injectable()
export class VoteService {
  constructor(
    @InjectRepository(VotesModel) private voteRepo: Repository<VotesModel>,
    private userService: UsersService,
    private redisService: RedisService,
    @Inject(forwardRef(() => PollrestService))
    private pollService: PollrestService,
    private voteLogService: VotelogService,
  ) {}
  async create(createVoteInput: CreateVoteInput, req: Request) {
    if (req.user) {
      const user = await this.userService.findOne(req.user.id);
      const poll = await this.pollService.findOne(+createVoteInput.pollId);
      await this.voteLogService.saveLog({
        userId: user.id,
        pollId: createVoteInput.pollId,
        method: req.method,
        path: req.url,
        ip: req.ip || 'none',
        status: LogStatus.ATTEMPTED,
      });
      if (!poll.options.includes(createVoteInput.selectedOption))
        throw new BadRequestException('Invalid options for vote');
      const voteExists = await this.voteRepo.findOne({
        where: { userId: user.id, pollId: poll.id },
      });
      if (voteExists) throw new BadRequestException('You have allready voted!');
      const vote = this.voteRepo.create({
        userId: user.id,
        poll: poll,
        ...createVoteInput,
      });
      await this.redisService.del('votes:all');
      try {
        await this.voteRepo.save(vote);
        await this.voteLogService.saveLog({
          userId: user.id,
          pollId: createVoteInput.pollId,
          method: req.method,
          path: req.url,
          ip: req.ip || 'none',
          status: LogStatus.SUCCESS,
        });
        return vote;
      } catch (error) {
        await this.voteLogService.saveLog({
          userId: user.id,
          pollId: createVoteInput.pollId,
          method: req.method,
          path: req.url,
          ip: req.ip || 'none',
          status: LogStatus.ERROR,
        });
        throw new BadRequestException(error.message);
      }
    } else {
      await this.voteLogService.saveLog({
        userId: 'unathorized',
        pollId: createVoteInput.pollId,
        method: req.method,
        path: req.url,
        ip: req.ip || 'none',
        status: LogStatus.ATTEMPTED,
      });
      throw new UnauthorizedException('Please login.User not logged in');
    }
  }

  async findAll(page: number, limit: number) {
    if (page < 1 || limit < 1)
      throw new BadRequestException(`Invalid ${page < 1 ? 'page' : 'limit'}`);

    let votes: any[];
    let votesCount: number;

    const votesCache = await this.redisService.get(`votes:list:${page}`);
    const votesCacheCount = await this.redisService.get(`votes:all`);

    const offset = (page - 1) * limit;

    const [votesDb, votesDBCount] = await this.voteRepo.findAndCount({
      take: limit,
      skip: offset,
      where: { isActive: true },
    });

    if (votesDb.length === 0) throw new NotFoundException('No votes found');
    if (votesCache && votesCacheCount) {
      votes = JSON.parse(votesCache);
      votesCount = +votesCacheCount;
    } else {
      votes = votesDb;
      votesCount = votesDBCount;
    }

    const totalPages = Math.ceil(votesCount / limit);

    if (votesDb.length > 0 && votesDBCount >= 1) {
      await this.redisService.set(`votes:list:${page}`, votesDb, 60);
      await this.redisService.set(`votes:all`, votesDBCount, 60);
    }

    return {
      totalPages,
      currentPage: page,
      hasNextPage: page < totalPages,
      totalVotes: votesCount,
      data: votes,
    };
  }

  async findAllByPollId(poll: number) {
    const votes = await this.voteRepo.find({
      where: { isActive: true, pollId: poll },
    });
    if (votes.length === 0) throw new NotFoundException('No votes found');
    return votes;
  }

  async findOne(id: number) {
    if (id < 1) throw new BadRequestException('Invalid id');
    const vote = await this.voteRepo.findOne({
      where: { id, isActive: true },
    });
    if (!vote) throw new NotFoundException('Vote not found');
    return vote;
  }

  async update(id: number, updateVoteInput: UpdateVoteInput) {
    const vote = await this.findOne(id);

    vote.isActive = updateVoteInput.isActive ?? vote.isActive;
    vote.selectedOption = updateVoteInput.selectedOption ?? vote.selectedOption;
    return await this.voteRepo.save(vote);
  }

  async remove(id: number) {
    const vote = await this.findOne(id);
    await this.update(vote.id, { isActive: false });
    return vote;
  }
  async deleteByPollId(pollId: number) {
    if (pollId < 1) throw new BadRequestException('Invalid id');
    const vote = await this.voteRepo.find({
      where: { pollId, isActive: true },
    });
    if (!vote) throw new NotFoundException('Vote not found');
    await this.voteRepo.update({ pollId }, { isActive: false });
    return vote;
  }
}
