import {
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
import { UsersController } from './user.controller';
import { UsersService } from './user.service';
import { LoggerMiddleware } from './logger/logger.middleware';
import { PrismaService } from 'src/prisma.service';
import { JwtStrategy } from '../auth/jwt.strategy';
import { PassportModule } from '@nestjs/passport';

@Module({
  imports: [PassportModule],
  controllers: [UsersController],
  providers: [UsersService, PrismaService, JwtStrategy],
})
export class UsersModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(LoggerMiddleware)
      .forRoutes(
        { path: 'users', method: RequestMethod.GET },
        { path: 'users', method: RequestMethod.POST },
      );
  }
}
