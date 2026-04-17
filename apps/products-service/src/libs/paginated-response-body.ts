import { ApiProperty } from '@nestjs/swagger';

export class PaginatedResponseBody<T> {
  @ApiProperty({ isArray: true })
  data: T[];

  @ApiProperty({ example: 10 })
  total_results: number;
}
