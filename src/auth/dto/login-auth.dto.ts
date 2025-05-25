import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  IsString,
  IsStrongPassword,
} from 'class-validator';

export class LoginAuthDto {
  @ApiProperty({ description: 'User email', example: 'samar12@gmail.com' })
  @IsNotEmpty()
  @IsString()
  @IsEmail()
  email: string;

  @ApiProperty({ description: 'User password', example: 'StrongPassword!1' })
  @IsNotEmpty()
  @IsString()
  @IsStrongPassword()
  password: string;
}
