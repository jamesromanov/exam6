import { Type } from 'class-transformer';
import { IsInt } from 'class-validator';

export class QueryDto {
  @IsInt()
  @Type(() => Number)
  page?: number;
  @IsInt()
  @Type(() => Number)
  limit?: number;
}
