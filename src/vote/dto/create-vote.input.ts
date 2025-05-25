import { InputType, Field, ID } from '@nestjs/graphql';
import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

@InputType()
export class CreateVoteInput {
  @IsNumber({ allowNaN: false })
  @Type(() => Number)
  @IsNotEmpty()
  @Field(() => ID!, { description: 'Vote poll' })
  pollId: number;

  @IsString()
  @IsNotEmpty()
  @Field(() => String, { description: 'Vote selected option' })
  selectedOption: string;

  @IsBoolean()
  @IsOptional()
  @Field(() => Boolean, { description: 'Vote status', defaultValue: true })
  isActive?: boolean = true;
}
