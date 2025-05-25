import { Resolver, Query, Context, Args, Int } from '@nestjs/graphql';
import { PollService } from './poll.service';
import { Poll } from './entities/poll.entity';
import { Request } from 'express';
import { GqlGuard } from 'src/auth/jwtguard/jwt.guard';
import { UseGuards } from '@nestjs/common';
import { RolesGuard } from 'src/guards/role.guards';
import { Roles } from 'src/auth/roles.key';
import { UserRole } from 'src/users/user.role';
import { CustomPoll } from './poll.custom';

@UseGuards(GqlGuard, RolesGuard)
@Resolver(() => Poll)
export class PollResolver {
  constructor(private readonly pollService: PollService) {}

  // userlar uchun polls olish
  @Roles(UserRole.USER)
  @Query(() => CustomPoll, { name: 'polls' })
  findAll(
    @Context() { req }: { req: Request },
    @Args('page', { type: () => Int }) page: number,
    @Args('limit', { type: () => Int }) limit: number,
  ) {
    return this.pollService.findAll(req, page, limit);
  }

  // adminlar uchun olish
  @Roles(UserRole.ADMIN)
  @Query(() => CustomPoll, { name: 'adminPolls' })
  findAllAdmin(
    @Args('page', { type: () => Int }) page: number,
    @Args('limit', { type: () => Int }) limit: number,
  ) {
    return this.pollService.findAllAdmin(page, limit);
  }
}
