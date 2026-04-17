import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SequelizeOptionsFactory, SequelizeModuleOptions } from '@nestjs/sequelize';
import * as cls from 'cls-hooked';
import { Sequelize } from 'sequelize-typescript';

const namespace = cls.createNamespace('sequelize-cls');
(Sequelize as any).useCLS(namespace);

@Injectable()
export class SequelizeConfig implements SequelizeOptionsFactory {
  constructor(private readonly configService: ConfigService) {}

  createSequelizeOptions(): SequelizeModuleOptions {
    return {
      dialect: 'postgres',
      host: this.configService.get<string>('DB_HOST', 'localhost'),
      port: this.configService.get<number>('DB_PORT', 5432),
      username: this.configService.get<string>('DB_USER', 'ecommerce'),
      password: this.configService.get<string>('DB_PASS', 'ecommerce_pass'),
      database: this.configService.get<string>('DB_NAME', 'ecommerce_db'),
      schema: this.configService.get<string>('DB_SCHEMA', 'products'),
      models: [__dirname + '/../../../database/models/**/*.model{.ts,.js}'],
      autoLoadModels: true,
      synchronize: this.configService.get<string>('NODE_ENV') !== 'production',
      logging: this.configService.get<string>('DEBUG') === 'true' ? console.log : false,
      dialectOptions: {
        timezone: '-05:00',
      },
      define: {
        underscored: true,
      },
    };
  }
}
