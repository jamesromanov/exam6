import { ObjectType, Field, Int } from '@nestjs/graphql';
import { User } from 'src/users/entities/user.entity';

@ObjectType()
export class Poll {
  @Field(() => Int, { description: 'Poll id' })
  id: number;

  @Field(() => String, { description: 'Poll question' })
  question: string;
  @Field(() => [String], { description: 'Poll options' })
  options: string[];

  @Field(() => Boolean, { description: 'Poll status' })
  isActive: boolean;

  @Field(() => User, { description: 'Poll user' })
  createdBy: User;

  @Field(() => Date, { description: 'Poll created time' })
  createdAt: Date;
}
