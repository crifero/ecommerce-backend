import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { JwtModule } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { Product } from '@models/product.model';
import { ProductsService } from './products.service';
import { ProductsController } from './products.controller';
import { ProductProfile } from './mapper/product.profile';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
import { RolesGuard } from '../../guards/roles.guard';
import { ServiceKeyGuard } from '../../guards/service-key.guard';
import { ProductsInternalController } from './products-internal.controller';

@Module({
  imports: [
    SequelizeModule.forFeature([Product]),
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.get<string>('JWT_SECRET', 'jwt_secret_change_in_production'),
      }),
    }),
  ],
  controllers: [ProductsController, ProductsInternalController],
  providers: [ProductsService, ProductProfile, JwtAuthGuard, RolesGuard, ServiceKeyGuard],
  exports: [ProductsService],
})
export class ProductsModule {}
