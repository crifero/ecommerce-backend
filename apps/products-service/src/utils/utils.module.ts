import { Global, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { SequelizeConfig } from './config/sequelize/sequelize-config.service';

@Global()
@Module({
  imports: [ConfigModule],
  providers: [SequelizeConfig],
  exports: [SequelizeConfig],
})
export class UtilsModule {}
