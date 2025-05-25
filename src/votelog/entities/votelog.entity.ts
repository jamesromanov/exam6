import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

export enum LogStatus {
  ATTEMPTED = 'ATTEMPTED',
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR',
}
@Entity({ name: 'votelogs' })
export class Votelog {
  @PrimaryGeneratedColumn()
  id: number;
  @Column()
  userId: string | 'unathorized';
  @Column()
  pollId: number;

  @Column()
  method: string;

  @Column()
  path: string;
  @Column()
  ip: string;

  @Column({ type: 'enum', enum: LogStatus, default: LogStatus.ATTEMPTED })
  status: LogStatus;
  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  timstamp: Date;
}
