import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsBoolean } from 'class-validator';
import { ToBoolean } from '@libs/transform-decorator';

export class SearchProductDto {
  @ApiPropertyOptional({ example: 1, description: 'Page number' })
  @IsOptional()
  page?: number;

  @ApiPropertyOptional({ example: 10, description: 'Items per page' })
  @IsOptional()
  size?: number;

  @ApiPropertyOptional({ example: true, description: 'Enable pagination' })
  @IsOptional()
  @ToBoolean()
  @IsBoolean()
  paginated?: boolean;

  @ApiPropertyOptional({ example: 'Laptop', description: 'Search by name' })
  @IsOptional()
  @IsString()
  name?: string;
}
