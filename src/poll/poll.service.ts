import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PollModel } from './entities/poll.model';
import { Repository } from 'typeorm';
import { UsersService } from 'src/users/users.service';
import { Request } from 'express';
import { RedisService } from 'src/redis/redis.service';

@Injectable()
export class PollService {
  constructor(
    @InjectRepository(PollModel) private pollRepo: Repository<PollModel>,
    private userService: UsersService,
    private redisService: RedisService,
  ) {}

  async findAll(req: Request, page: number, limit: number) {
    const userId = req.user?.id;
    if (userId) {
      const user = await this.userService.findOne(userId);
      if (limit < 1 || page < 1)
        throw new BadRequestException(
          `Invalid ${page < 1 ? 'page' : 'limit'} value`,
        );

      const cachePolls = await this.redisService.get(`polls:user:${page}`);
      const cachePollsCount = await this.redisService.get(`polls:user:all`);

      const offset = (page - 1) * limit;

      let Polls: any[];
      let PollsCount: number;

      const [polls, pollsCount] = await this.pollRepo.findAndCount({
        take: offset,
        skip: limit,
        where: {
          userId: user.id,
          isActive: true,
        },
      });
      if (polls.length === 0) throw new NotFoundException('No polls found');

      if (cachePolls && cachePollsCount) {
        Polls = JSON.parse(cachePolls);
        PollsCount = +cachePollsCount;
      } else {
        Polls = polls;
        PollsCount = pollsCount;
      }
      const totalPages = Math.ceil(PollsCount / limit);

      if (polls.length > 0 && pollsCount >= 1) {
        await this.redisService.set(`polls:user:${page}`, Polls, 60);
        await this.redisService.set(`polls:user:all`, PollsCount, 60);
      }
      return {
        totalPages,
        currentPage: page,
        hasNextPage: page < totalPages,
        totalPolls: PollsCount,
        data: Polls,
      };
    } else {
      throw new UnauthorizedException("Couldn't find the token");
    }
  }
  async findAllAdmin(page: number, limit: number) {
    if (limit < 1 || page < 1)
      throw new BadRequestException(
        `Invalid ${page < 1 ? 'page' : 'limit'} value`,
      );

    const cachePolls = await this.redisService.get(`polls:admin:${page}`);
    const cachePollsCount = await this.redisService.get(`polls:admin:all`);

    const offset = (page - 1) * limit;

    let Polls: any[];
    let PollsCount: number;

    const [polls, pollsCount] = await this.pollRepo.findAndCount({
      take: offset,
      skip: limit,
    });
    if (polls.length === 0) throw new NotFoundException('No polls found');

    if (cachePolls && cachePollsCount) {
      Polls = JSON.parse(cachePolls);
      PollsCount = +cachePollsCount;
    } else {
      Polls = polls;
      PollsCount = pollsCount;
    }
    const totalPages = Math.ceil(PollsCount / limit);

    if (polls.length > 0 && pollsCount >= 1) {
      await this.redisService.set(`polls:admin:${page}`, Polls, 60);
      await this.redisService.set(`polls:admin:all`, PollsCount, 60);
    }
    return {
      totalPages,
      currentPage: page,
      hasNextPage: page < totalPages,
      totalPolls: PollsCount,
      data: Polls,
    };
  }
}
