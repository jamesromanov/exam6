import { CreateVoteInput } from './create-vote.input';
import { InputType, PartialType } from '@nestjs/graphql';

@InputType()
export class UpdateVoteInput extends PartialType(CreateVoteInput) {}
