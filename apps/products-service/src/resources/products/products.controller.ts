import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  ParseIntPipe,
  Query,
  HttpCode,
  HttpStatus,
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
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { GetProductDto } from './dto/get-product.dto';
import { SearchProductDto } from './dto/search-product.dto';
import { PaginatedResponseBody } from '@libs/paginated-response-body';

@ApiTags('products')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}


  @Get()
  @Roles('admin', 'user')
  @ApiOperation({ summary: 'List products (supports pagination and search)' })
  @ApiResponse({ status: 200, description: 'List of products', type: GetProductDto, isArray: true })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  findAll(
    @Query() query: SearchProductDto,
  ): Promise<GetProductDto[] | PaginatedResponseBody<GetProductDto>> {
    return this.productsService.findAll(query);
  }

  @Get(':id')
  @Roles('admin', 'user')
  @ApiOperation({ summary: 'Get product by ID' })
  @ApiParam({ name: 'id', type: 'number' })
  @ApiResponse({ status: 200, type: GetProductDto })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Product not found' })
  findOne(@Param('id', ParseIntPipe) id: number): Promise<GetProductDto> {
    return this.productsService.findOne(id);
  }

  @Post()
  @Roles('admin')
  @ApiOperation({ summary: 'Create a new product (admin only)' })
  @ApiResponse({ status: 201, type: GetProductDto })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 409, description: 'Product already exists' })
  create(@Body() dto: CreateProductDto): Promise<GetProductDto> {
    return this.productsService.create(dto);
  }

  @Patch(':id')
  @Roles('admin')
  @ApiOperation({ summary: 'Update a product (admin only)' })
  @ApiParam({ name: 'id', type: 'number' })
  @ApiResponse({ status: 200, type: GetProductDto })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Product not found' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateProductDto,
  ): Promise<GetProductDto> {
    return this.productsService.update(id, dto);
  }

  @Delete(':id')
  @Roles('admin')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Soft-delete a product (admin only)' })
  @ApiParam({ name: 'id', type: 'number' })
  @ApiResponse({ status: 200, description: 'Product removed' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Product not found' })
  remove(@Param('id', ParseIntPipe) id: number): Promise<{ message: string }> {
    return this.productsService.remove(id);
  }
}
