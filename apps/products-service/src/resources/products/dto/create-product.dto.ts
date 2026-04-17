import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNumber,
  IsOptional,
  IsBoolean,
  Min,
  IsInt,
  MinLength,
} from 'class-validator';
import { ToNumber } from '@libs/transform-decorator';

export class CreateProductDto {
  @ApiProperty({ example: 'Laptop Pro 15' })
  @IsString()
  @MinLength(1)
  name: string;

  @ApiPropertyOptional({ example: 'High performance laptop with 16GB RAM' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ example: 199 })
  @ToNumber()
  @IsNumber()
  @Min(0)
  price: number;

  @ApiPropertyOptional({ example: 50, default: 0 })
  @IsOptional()
  @ToNumber()
  @IsInt()
  @Min(0)
  stock?: number;

  @ApiPropertyOptional({ example: true, default: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
