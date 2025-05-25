import { ObjectType, Field, Int } from '@nestjs/graphql';
import { Poll } from 'src/poll/entities/poll.entity';
import { User } from 'src/users/entities/user.entity';

@ObjectType()
export class Vote {
  @Field(() => Int, { description: 'Vote id' })
  id: number;
  @Field(() => User, { description: 'Vote user id' })
  userId: User;
  @Field(() => Poll, { description: 'Vote poll' })
  pollId: Poll;
  @Field(() => String, { description: 'Vote selected option' })
  selectedOption: string;
  @Field(() => Boolean, { description: 'Vote status', defaultValue: true })
  isActive: boolean;
  @Field(() => Date, { description: 'Vote created time' })
  createdAt: Date;
}
