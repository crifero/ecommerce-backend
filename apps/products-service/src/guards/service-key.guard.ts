import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';

@Injectable()
export class ServiceKeyGuard implements CanActivate {
  constructor(private readonly config: ConfigService) {}

  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest<Request>();
    const key = req.headers['x-service-key'];
    const expected = this.config.get<string>('SERVICE_KEY', 'internal_service_key');
    if (key !== expected) {
      throw new UnauthorizedException('Invalid service key');
    }
    return true;
  }
}
