import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { JwtModule } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { User } from '@models/user.model';
import { Role } from '@models/role.model';
import { RoleSeeder } from '../../database/seeders/role.seeder';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';

@Module({
  imports: [
    SequelizeModule.forFeature([User, Role]),
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.get<string>('JWT_SECRET', 'jwt_secret_change_in_production'),
        signOptions: { expiresIn: config.get<string>('JWT_EXPIRES_IN', '24h') },
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, RoleSeeder],
})
export class AuthModule {}
