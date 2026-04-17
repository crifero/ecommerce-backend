import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { Product } from '@models/product.model';
import { ProductsService } from './products.service';
import { ProductsController } from './products.controller';
import { ProductProfile } from './mapper/product.profile';

@Module({
  imports: [SequelizeModule.forFeature([Product])],
  controllers: [ProductsController],
  providers: [ProductsService, ProductProfile],
  exports: [ProductsService],
})
export class ProductsModule {}
