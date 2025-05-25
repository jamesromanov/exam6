import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsBoolean, IsNotEmpty, IsString } from 'class-validator';

export class CreatePollrestDto {
  @ApiProperty({ description: 'Poll question', example: 'Some question' })
  @IsString()
  @IsNotEmpty()
  question: string;

  @ApiProperty({
    description: 'Poll options',
    example: ['poll'],
  })
  @IsArray()
  @IsNotEmpty()
  options: string[];

  @ApiProperty({ description: 'Poll status', default: true })
  @IsBoolean()
  isActive: boolean;
}
