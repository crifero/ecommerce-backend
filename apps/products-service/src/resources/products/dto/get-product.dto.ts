import { AutoMap } from '@automapper/classes';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class GetProductDto {
  @AutoMap()
  @ApiProperty({ example: 1 })
  id: number;

  @AutoMap()
  @ApiProperty({ example: 'Laptop Pro 15' })
  name: string;

  @AutoMap()
  @ApiPropertyOptional({ example: 'High performance laptop' })
  description: string;

  @AutoMap()
  @ApiProperty({ example: 1299.99 })
  price: number;

  @AutoMap()
  @ApiProperty({ example: 50 })
  stock: number;

  @AutoMap()
  @ApiProperty({ example: true })
  isActive: boolean;

  @AutoMap()
  @ApiProperty({ example: '2024-01-01T00:00:00.000Z' })
  createdAt: Date;

  @AutoMap()
  @ApiProperty({ example: '2024-01-01T00:00:00.000Z' })
  updatedAt: Date;
}
