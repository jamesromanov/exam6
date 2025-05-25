import { CreatePollInput } from './create-poll.input';
import { InputType, PartialType } from '@nestjs/graphql';

@InputType()
export class UpdatePollInput extends PartialType(CreatePollInput) {}
