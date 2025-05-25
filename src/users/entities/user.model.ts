import {
  BeforeInsert,
  BeforeUpdate,
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { UserRole } from '../user.role';
import * as bcrypt from 'bcrypt';
import { Exclude } from 'class-transformer';

@Entity({ name: 'users' })
export class UserModel {
  @PrimaryGeneratedColumn()
  declare id: number;

  @Column()
  declare name: string;

  @Column({ nullable: false, unique: true })
  declare email: string;

  @Column({ nullable: false })
  @Exclude()
  declare password: string;

  @Column({ default: UserRole.USER, enum: UserRole, type: 'enum' })
  declare role: UserRole;

  @Column({ nullable: true })
  declare refreshToken: string;

  @Column({ default: true })
  declare isActive: boolean;

  @CreateDateColumn()
  declare createdAt: Date;

  @UpdateDateColumn()
  declare updatedAt: Date;

  toJson() {
    const { password, refreshToken, ...otherData } = this;
    return otherData;
  }
  @BeforeInsert()
  @BeforeUpdate()
  async hashPassword() {
    if (this.password && !this.password.startsWith('$2b$')) {
      const salt = 12;
      this.password = await bcrypt.hash(this.password, salt);
    }
  }

  async comparePassword(password: string) {
    return await bcrypt.compare(password, this.password);
  }
}
