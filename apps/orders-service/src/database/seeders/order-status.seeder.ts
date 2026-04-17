import { Injectable, OnApplicationBootstrap, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { OrderStatus } from '../models/order-status.model';

@Injectable()
export class OrderStatusSeeder implements OnApplicationBootstrap {
  private readonly logger = new Logger(OrderStatusSeeder.name);

  constructor(
    @InjectModel(OrderStatus)
    private readonly statusModel: typeof OrderStatus,
  ) {}

  async onApplicationBootstrap() {
    const statuses = ['pending', 'delivered', 'cancelled'];

    for (const description of statuses) {
      const [, created] = await this.statusModel.findOrCreate({
        where: { description },
        defaults: { description, isActive: true } as any,
      });

      if (created) {
        this.logger.log(`Seeded order status: ${description}`);
      }
    }
  }
}
