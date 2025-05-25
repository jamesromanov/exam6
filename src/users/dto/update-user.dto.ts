import { PartialType } from '@nestjs/mapped-types';
import { CreateUserDto } from './create-user.dto';
import { ApiProperty } from '@nestjs/swagger';
import {
  IsBoolean,
  IsEmail,
  IsEnum,
  IsOptional,
  IsString,
  IsStrongPassword,
} from 'class-validator';
import { UserRole } from '../user.role';

export class UpdateUserDto extends PartialType(CreateUserDto) {
  @ApiProperty({ type: 'string', description: 'User name', example: 'Samar' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({
    type: 'string',
    description: 'User email',
    example: 'samar12@gmail.com',
  })
  @IsOptional()
  @IsString()
  @IsEmail()
  email?: string;

  @ApiProperty({
    type: 'string',
    description: 'User password',
    example: 'StrongPassword!1',
  })
  @IsOptional()
  @IsStrongPassword()
  @IsString()
  password?: string;

  @ApiProperty({
    type: 'string',
    description: 'User role',
    example: UserRole.USER,
  })
  @IsOptional()
  @IsEnum(UserRole)
  role?: UserRole = UserRole.USER;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean = true;

  @IsOptional()
  @IsString()
  refreshToken?: string | null;
}
