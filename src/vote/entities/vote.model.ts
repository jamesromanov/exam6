import { PollModel } from 'src/poll/entities/poll.model';
import { UserModel } from 'src/users/entities/user.model';
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity({ name: 'votes' })
export class VotesModel {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => UserModel)
  user: UserModel;

  @Column()
  userId: number;
  @ManyToOne(() => PollModel)
  poll: PollModel;

  @Column()
  pollId: number;

  @Column()
  selectedOption: string;

  @Column({ default: true })
  isActive: boolean = true;
  @CreateDateColumn()
  createdAt: Date;
}
