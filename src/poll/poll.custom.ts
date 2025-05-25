import { Field, Int, ObjectType } from '@nestjs/graphql';
import { Poll } from './entities/poll.entity';

@ObjectType()
export class CustomPoll {
  @Field(() => Int, { description: 'Poll totalpage' })
  totalPages: number;
  @Field(() => Int, { description: 'Poll page' })
  currentPage: number;

  @Field(() => Int, { description: 'Poll nest page' })
  hasNextPage: boolean;

  @Field(() => Int, { description: 'Poll totalcount' })
  totalPolls: number;

  @Field(() => [Poll], { description: 'Polls' })
  data: Poll[];
}
