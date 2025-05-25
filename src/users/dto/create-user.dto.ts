import { ApiProperty } from '@nestjs/swagger';
import {
  IsBoolean,
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsStrongPassword,
} from 'class-validator';
import { UserRole } from '../user.role';
export class CreateUserDto {
  @ApiProperty({ type: 'string', description: 'User name', example: 'Samar' })
  @IsString()
  name: string;

  @ApiProperty({
    type: 'string',
    description: 'User email',
    example: 'samar12@gmail.com',
  })
  @IsNotEmpty()
  @IsString()
  @IsEmail()
  email: string;

  @ApiProperty({
    type: 'string',
    description: 'User password',
    example: 'StrongPassword!1',
  })
  @IsNotEmpty()
  @IsString()
  @IsStrongPassword()
  password: string;

  @ApiProperty({
    type: 'string',
    description: 'User role',
    example: UserRole.USER,
  })
  @IsOptional()
  @IsEnum(UserRole)
  role: UserRole = UserRole.USER;

  @IsOptional()
  @IsBoolean()
  isActive: boolean = true;
}
