import { LogStatus } from '../entities/votelog.entity';

export class VotelogDto {
  userId: string | 'unathorized';
  pollId: number;
  method: string;
  path: string;
  ip: string;
  status: LogStatus;
}
