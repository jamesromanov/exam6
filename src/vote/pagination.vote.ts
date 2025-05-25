import { Field, Int, ObjectType } from '@nestjs/graphql';
import { Vote } from './entities/vote.entity';

@ObjectType()
export class CustomVote {
  @Field(() => Int, { description: 'TotalPages' })
  totalPages: number;
  @Field(() => Int, { description: 'Currentpage' })
  currentPage: number;

  @Field(() => Boolean, { description: 'Has next page' })
  hasNextPage: boolean;

  @Field(() => Int, { description: 'Votes count' })
  totalVotes: number;

  @Field(() => [Vote], { description: 'Votes' })
  data: Vote[];
}
