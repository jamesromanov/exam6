import { UserModel } from 'src/users/entities/user.model';
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity({ name: 'polls' })
export class PollModel {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: false })
  question: string;

  @Column({ nullable: false, type: 'varchar', array: true })
  options: string[];

  @Column({ default: true })
  isActive: boolean = true;

  @ManyToOne(() => UserModel)
  createdBy: UserModel;

  @Column()
  userId: number;

  @CreateDateColumn()
  createdAt: Date;
}
