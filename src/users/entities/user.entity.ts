import { UserRole } from '../user.role';
import { Field, ID, ObjectType, registerEnumType } from '@nestjs/graphql';

@ObjectType()
export class User {
  @Field(() => ID, { description: 'User id' })
  declare id: number;

  @Field(() => String, { description: 'User name' })
  declare name: string;

  @Field(() => String, { description: 'User email' })
  declare email: string;

  @Field(() => String, { description: 'User password' })
  declare password: string;

  @Field(() => UserRole, {
    defaultValue: UserRole.USER,
    description: 'User Role',
  })
  declare role: UserRole;

  @Field(() => String, { description: 'User Refreshtoken', nullable: true })
  declare refreshToken: string;

  @Field(() => Boolean, { description: 'User status', defaultValue: true })
  declare isActive: boolean;

  @Field(() => Date, { description: 'User created time' })
  declare createdAt: Date;

  @Field(() => Date, { description: 'User updated time' })
  declare updatedAt: Date;
}

registerEnumType(UserRole, { name: 'UserRole' });
