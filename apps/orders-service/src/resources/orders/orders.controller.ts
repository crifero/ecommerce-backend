import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  ParseIntPipe,
  Query,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { GetOrderDto } from './dto/get-order.dto';
import { SearchOrderDto } from './dto/search-order.dto';
import { PaginatedResponseBody } from '@libs/paginated-response-body';

@ApiTags('orders')
@ApiBearerAuth()
@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Get()
  @ApiOperation({ summary: 'List orders (supports pagination and date filters)' })
  @ApiResponse({ status: 200, type: GetOrderDto, isArray: true })
  findAll(
    @Query() query: SearchOrderDto,
  ): Promise<GetOrderDto[] | PaginatedResponseBody<GetOrderDto>> {
    return this.ordersService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get order by ID' })
  @ApiParam({ name: 'id', type: 'number' })
  @ApiResponse({ status: 200, type: GetOrderDto })
  @ApiResponse({ status: 404, description: 'Order not found' })
  findOne(@Param('id', ParseIntPipe) id: number): Promise<GetOrderDto> {
    return this.ordersService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new order (validates product stock via HTTP)' })
  @ApiResponse({ status: 201, type: GetOrderDto })
  @ApiResponse({ status: 400, description: 'Insufficient stock or invalid product' })
  @ApiResponse({ status: 404, description: 'Product not found' })
  create(@Body() dto: CreateOrderDto): Promise<GetOrderDto> {
    return this.ordersService.create(dto);
  }
}
