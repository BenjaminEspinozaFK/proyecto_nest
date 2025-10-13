import {
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { LoggerMiddleware } from 'src/user/logger/logger.middleware';
import { PrismaService } from 'src/prisma.service';
import { JwtStrategy } from '../auth/jwt.strategy';
import { PassportModule } from '@nestjs/passport';
import { AuthMiddleware } from 'src/user/auth/auth.middleware';

@Module({
  imports: [PassportModule],
  controllers: [AdminController],
  providers: [AdminService, PrismaService, JwtStrategy],
})
export class AdminModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(LoggerMiddleware)
      .forRoutes(
        { path: 'admins', method: RequestMethod.GET },
        { path: 'admins', method: RequestMethod.POST },
      )
      .apply(AuthMiddleware)
      .exclude(
        { path: 'admins/me/avatar', method: RequestMethod.POST },
        { path: 'admins/me', method: RequestMethod.GET },
      )
      .forRoutes('admins');
  }
}
