import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { Order } from '@models/order.model';
import { OrderItem } from '@models/order-item.model';
import { OrderStatus } from '@models/order-status.model';
import { OrdersService } from './orders.service';
import { OrdersController } from './orders.controller';
import { OrderProfile } from './mapper/order.profile';
import { OrderStatusSeeder } from '../../database/seeders/order-status.seeder';

@Module({
  imports: [SequelizeModule.forFeature([Order, OrderItem, OrderStatus])],
  controllers: [OrdersController],
  providers: [OrdersService, OrderProfile, OrderStatusSeeder],
  exports: [OrdersService],
})
export class OrdersModule {}
