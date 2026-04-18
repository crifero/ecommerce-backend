import { Controller, Get, Param, ParseIntPipe, UseGuards } from '@nestjs/common';
import { ApiExcludeController } from '@nestjs/swagger';
import { ServiceKeyGuard } from '../../guards/service-key.guard';
import { ProductsService } from './products.service';
import { GetProductDto } from './dto/get-product.dto';

@ApiExcludeController()
@UseGuards(ServiceKeyGuard)
@Controller('products/internal')
export class ProductsInternalController {
  constructor(private readonly productsService: ProductsService) {}

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number): Promise<GetProductDto> {
    return this.productsService.findOne(id);
  }
}
