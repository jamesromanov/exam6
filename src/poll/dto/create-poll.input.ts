import { InputType, Field, ID } from '@nestjs/graphql';
import {
  IsArray,
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  IsString,
} from 'class-validator';
import { User } from 'src/users/entities/user.entity';

@InputType()
export class CreatePollInput {
  @IsString()
  @Field(() => String, { description: 'Poll question' })
  question: string;

  @IsArray()
  @IsNotEmpty()
  @Field(() => [String], { description: 'Poll options' })
  options: string[];

  @IsBoolean()
  @Field(() => Boolean, { description: 'Poll status', nullable: true })
  isActive: boolean;

  @IsNumber()
  @Field(() => ID, { description: 'Poll user' })
  createdBy: User;
}
