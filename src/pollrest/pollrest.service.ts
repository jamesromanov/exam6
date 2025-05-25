import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { CreatePollrestDto } from './dto/create-pollrest.dto';
import { UpdatePollrestDto } from './dto/update-pollrest.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UsersService } from 'src/users/users.service';
import { PollRestModel } from './entities/pollrest.entity';
import { Request } from 'express';
import { RedisService } from 'src/redis/redis.service';
import { QueryDto } from 'src/users/query.dto.ts/query-dto';
import { VoteService } from 'src/vote/vote.service';

@Injectable()
export class PollrestService {
  constructor(
    @InjectRepository(PollRestModel)
    private pollRepo: Repository<PollRestModel>,
    private userService: UsersService,
    private redisService: RedisService,
    private voteService: VoteService,
  ) {}
  async createPolls(createPollDto: CreatePollrestDto, req: Request) {
    if (req.user?.id) {
      const user = await this.userService.findOne(req.user?.id!);
      if (!user) throw new NotFoundException('No users found');
      const poll = this.pollRepo.create({
        createdBy: user.id,
        userId: user.id,
        ...createPollDto,
      });
      await this.redisService.del(`polls:user:all`);
      await this.redisService.del(`polls:admin:all`);
      return await this.pollRepo.save(poll);
    } else {
      throw new UnauthorizedException('Please login. User is not logged in');
    }
  }

  async findAll(query: QueryDto) {
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 1;

    if (page < 1 || limit < 1)
      throw new BadRequestException(
        `Invalid ${page < 1 ? 'page' : 'limit'} value`,
      );

    const pollsCache = await this.redisService.get(`polls:list:${page}`);
    const pollsAllCountCache = await this.redisService.get(`polls:list:all`);

    let polls: any[];
    let pollsAllCount: number;

    const offset = (page - 1) * limit;

    const [dbPolls, dbPollsCount] = await this.pollRepo.findAndCount({
      skip: offset,
      take: limit,
    });
    if (dbPolls.length === 0) throw new NotFoundException('No polls found');

    if (pollsAllCountCache && pollsCache) {
      polls = JSON.parse(pollsCache);
      pollsAllCount = +pollsAllCountCache;
    } else {
      polls = dbPolls;
      pollsAllCount = dbPollsCount;
    }

    const totalPages = Math.ceil(pollsAllCount / limit);

    if (dbPolls.length > 0 && dbPollsCount >= 1) {
      await this.redisService.set(`polls:list:${page}`, dbPolls, 60);
      await this.redisService.set(`polls:list:all`, dbPollsCount, 60);
    }

    return {
      totalPages,
      currentPage: page,
      hasNextPage: page < totalPages,
      totalPolls: pollsAllCount,
      data: polls,
    };
  }

  async findOne(id: number) {
    if (id < 1) throw new BadRequestException('Invalid id');
    const poll = await this.pollRepo.findOne({ where: { id, isActive: true } });
    if (!poll) throw new NotFoundException('Poll not found');

    return poll;
  }

  async findById(id: number) {
    if (id < 1) throw new BadRequestException('Invalid id');
    let Poll: any;
    let Votes: any[];
    const pollCache = await this.redisService.get(`poll:id:${id}`);
    const votesCache = await this.redisService.get(`votes:pollid:${id}`);

    const poll = await this.pollRepo.findOne({
      where: { id, isActive: true },
    });
    if (!poll) throw new NotFoundException('Poll not found');
    const votes = await this.voteService.findAllByPollId(poll.id);

    if (pollCache && votesCache) {
      Poll = JSON.parse(pollCache);
      Votes = JSON.parse(votesCache);
    } else {
      Poll = poll;
      Votes = votes;
      await this.redisService.set(`poll:id:${id}`, poll, 60);
      await this.redisService.set(`votes:pollid:${id}`, votes, 60);
    }

    const results: { totalVotes?: number } = {};

    for (const i of Votes) {
      const { selectedOption } = i;
      if (results[selectedOption]) results[selectedOption] += 1;
      else results[selectedOption] = 1;
    }
    for (const [option, voteCount] of Object.entries(results)) {
      results[option] = Math.round(
        ((voteCount as number) * 100) / Votes.length,
      );
    }
    results.totalVotes = Votes.length;

    return results;
  }

  async update(id: number, updatePollrestDto: UpdatePollrestDto) {
    const poll = await this.findOne(id);

    poll.options = updatePollrestDto.options ?? poll.options;
    poll.question = updatePollrestDto.question ?? poll.question;
    poll.isActive = updatePollrestDto.isActive ?? poll.isActive;

    await this.redisService.del(`user:id:${id}`);
    return await this.pollRepo.save(poll);
  }

  async remove(id: number) {
    const poll = await this.findOne(id);
    await this.update(id, { isActive: false });
    await this.redisService.del(`user:id:${id}`);
    await this.voteService.deleteByPollId(poll.id);
    return 'Successfully deleted';
  }
}
