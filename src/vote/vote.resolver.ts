import { Resolver, Query, Mutation, Args, Int, Context } from '@nestjs/graphql';
import { VoteService } from './vote.service';
import { Vote } from './entities/vote.entity';
import { CreateVoteInput } from './dto/create-vote.input';
import { UpdateVoteInput } from './dto/update-vote.input';
import { Request } from 'express';
import { UseGuards } from '@nestjs/common';
import { GqlGuard } from 'src/auth/jwtguard/jwt.guard';
import { CustomVote } from './pagination.vote';

@Resolver(() => Vote)
export class VoteResolver {
  constructor(private readonly voteService: VoteService) {}

  @UseGuards(GqlGuard)
  @Mutation(() => Vote)
  votes(
    @Args('createVoteInput') createVoteInput: CreateVoteInput,
    @Context() { req }: { req: Request },
  ) {
    return this.voteService.create(createVoteInput, req);
  }

  @Query(() => CustomVote, { name: 'votes' })
  findAll(
    @Args('page', { type: () => Int, defaultValue: 1 }) page: number,
    @Args('limit', { type: () => Int, defaultValue: 10 }) limit: number,
  ) {
    return this.voteService.findAll(page, limit);
  }

  @Query(() => Vote, { name: 'vote' })
  findOne(@Args('id', { type: () => Int }) id: number) {
    return this.voteService.findOne(id);
  }

  @Mutation(() => Vote)
  updateVote(
    @Args('updateVoteInput') updateVoteInput: UpdateVoteInput,
    @Args('id') id: number,
  ) {
    return this.voteService.update(id, updateVoteInput);
  }

  @Mutation(() => Vote)
  removeVote(@Args('id', { type: () => Int }) id: number) {
    return this.voteService.remove(id);
  }
}
