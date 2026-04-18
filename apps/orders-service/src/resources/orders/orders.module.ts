import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { JwtModule } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { Order } from '@models/order.model';
import { OrderItem } from '@models/order-item.model';
import { OrderStatus } from '@models/order-status.model';
import { OrdersService } from './orders.service';
import { OrdersController } from './orders.controller';
import { OrderProfile } from './mapper/order.profile';
import { OrderStatusSeeder } from '../../database/seeders/order-status.seeder';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
import { RolesGuard } from '../../guards/roles.guard';

@Module({
  imports: [
    SequelizeModule.forFeature([Order, OrderItem, OrderStatus]),
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.get<string>('JWT_SECRET', 'jwt_secret_change_in_production'),
      }),
    }),
  ],
  controllers: [OrdersController],
  providers: [OrdersService, OrderProfile, OrderStatusSeeder, JwtAuthGuard, RolesGuard],
  exports: [OrdersService],
})
export class OrdersModule {}
