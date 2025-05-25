import { ApiProperty, PartialType } from '@nestjs/swagger';
import { CreatePollrestDto } from './create-pollrest.dto';
import { IsArray, IsBoolean, IsOptional, IsString } from 'class-validator';

export class UpdatePollrestDto extends PartialType(CreatePollrestDto) {
  @ApiProperty({ description: 'Poll question', example: 'Some question' })
  @IsString()
  @IsOptional()
  question?: string;

  @ApiProperty({
    description: 'Poll options',
    example: ['poll'],
  })
  @IsArray()
  @IsOptional()
  options?: string[];

  @ApiProperty({ description: 'Poll status', example: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean = true;
}
