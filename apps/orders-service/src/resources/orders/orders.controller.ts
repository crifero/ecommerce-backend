import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  ParseIntPipe,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
import { RolesGuard } from '../../guards/roles.guard';
import { Roles } from '../../decorators/roles.decorator';
import { CurrentUser, JwtPayload } from '../../decorators/current-user.decorator';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { GetOrderDto } from './dto/get-order.dto';
import { SearchOrderDto } from './dto/search-order.dto';
import { PaginatedResponseBody } from '@libs/paginated-response-body';

@ApiTags('orders')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Get()
  @Roles('admin', 'user')
  @ApiOperation({ summary: 'List my orders (supports pagination and date filters)' })
  @ApiResponse({ status: 200, type: GetOrderDto, isArray: true })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  findAll(
    @Query() query: SearchOrderDto,
    @CurrentUser() user: JwtPayload,
  ): Promise<GetOrderDto[] | PaginatedResponseBody<GetOrderDto>> {
    return this.ordersService.findAll(query, user.sub);
  }

  @Get(':id')
  @Roles('admin', 'user')
  @ApiOperation({ summary: 'Get my order by ID' })
  @ApiParam({ name: 'id', type: 'number' })
  @ApiResponse({ status: 200, type: GetOrderDto })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Order not found' })
  findOne(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: JwtPayload,
  ): Promise<GetOrderDto> {
    return this.ordersService.findOne(id, user.sub);
  }

  @Post()
  @Roles('admin', 'user')
  @ApiOperation({ summary: 'Create a new order' })
  @ApiResponse({ status: 201, type: GetOrderDto })
  @ApiResponse({ status: 400, description: 'Insufficient stock or invalid product' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Product not found' })
  create(
    @Body() dto: CreateOrderDto,
    @CurrentUser() user: JwtPayload,
  ): Promise<GetOrderDto> {
    return this.ordersService.create(dto, user.sub);
  }
}
