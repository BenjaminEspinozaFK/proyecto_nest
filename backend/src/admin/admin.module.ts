import {
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { LoggerMiddleware } from 'src/user/logger/logger.middleware';
import { AuthMiddleware } from 'src/user/auth/auth.middleware';
import { PrismaService } from 'src/prisma.service';

@Module({
  controllers: [AdminController],
  providers: [AdminService, PrismaService],
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
      .forRoutes('admins');
  }
}
