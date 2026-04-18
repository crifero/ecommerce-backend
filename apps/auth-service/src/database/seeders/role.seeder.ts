import { Injectable, OnApplicationBootstrap, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Role } from '../models/role.model';

const DEFAULT_ROLES = ['admin', 'user'];

@Injectable()
export class RoleSeeder implements OnApplicationBootstrap {
  private readonly logger = new Logger(RoleSeeder.name);

  constructor(@InjectModel(Role) private readonly roleModel: typeof Role) {}

  async onApplicationBootstrap() {
    for (const name of DEFAULT_ROLES) {
      const [, created] = await this.roleModel.findOrCreate({
        where: { name },
        defaults: { name, isActive: true } as any,
      });
      if (created) {
        this.logger.log(`Role seeded: ${name}`);
      }
    }
  }
}
