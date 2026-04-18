import { AutoMap } from '@automapper/classes';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class GetOrderItemDto {
  @AutoMap()
  @ApiProperty({ example: 1 })
  id: number;

  @AutoMap()
  @ApiProperty({ example: 5 })
  productId: number;

  @AutoMap()
  @ApiProperty({ example: 'Laptop Pro 15' })
  productName: string;

  @AutoMap()
  @ApiProperty({ example: 1299 })
  productPrice: number;

  @AutoMap()
  @ApiProperty({ example: 2 })
  quantity: number;

  @AutoMap()
  @ApiProperty({ example: 298 })
  subtotal: number;

  @AutoMap()
  @ApiProperty({ example: true })
  isActive: boolean;

  @AutoMap()
  @ApiProperty({ example: false })
  wasDeleted: boolean;

  @AutoMap()
  @ApiProperty({ example: '2024-01-01T00:00:00.000Z' })
  createdAt: Date;

  @AutoMap()
  @ApiProperty({ example: '2024-01-01T00:00:00.000Z' })
  updatedAt: Date;
}

export class GetOrderDto {
  @AutoMap()
  @ApiProperty({ example: 1 })
  id: number;

  @AutoMap()
  @ApiProperty({ example: 'pending' })
  status: string;

  @AutoMap()
  @ApiProperty({ example: 298 })
  total: number;

  @AutoMap()
  @ApiPropertyOptional({ example: 'Deliver before noon' })
  observations: string;

  @AutoMap()
  @ApiProperty({ type: [GetOrderItemDto] })
  items: GetOrderItemDto[];

  @AutoMap()
  @ApiProperty({ example: '2024-01-01T00:00:00.000Z' })
  createdAt: Date;

  @AutoMap()
  @ApiProperty({ example: '2024-01-01T00:00:00.000Z' })
  updatedAt: Date;
}
