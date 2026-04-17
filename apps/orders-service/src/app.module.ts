import { MiddlewareConsumer, Module, RequestMethod } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { SequelizeModule } from '@nestjs/sequelize';
import { AutomapperModule } from '@automapper/nestjs';
import { classes } from '@automapper/classes';
import { SequelizeConfig } from './utils/config/sequelize/sequelize-config.service';
import { UtilsModule } from './utils/utils.module';
import { ResourcesModule } from './resources/resources.module';
import { LoggerMiddleware } from './middleware/logger/logger.middleware';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    SequelizeModule.forRootAsync({
      useClass: SequelizeConfig,
    }),
    AutomapperModule.forRoot({
      strategyInitializer: classes(),
    }),
    UtilsModule,
    ResourcesModule,
  ],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(LoggerMiddleware)
      .forRoutes({ path: '*', method: RequestMethod.ALL });
  }
}
