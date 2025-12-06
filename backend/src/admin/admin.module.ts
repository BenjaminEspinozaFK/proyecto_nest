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
import { RolesGuard } from 'src/auth/roles.guard';
import { EmailService } from '../email/email.service';

@Module({
  imports: [PassportModule],
  controllers: [AdminController],
  providers: [
    AdminService,
    PrismaService,
    JwtStrategy,
    RolesGuard,
    EmailService,
  ],
})
export class AdminModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(LoggerMiddleware)
      .forRoutes(
        { path: 'admins', method: RequestMethod.GET },
        { path: 'admins', method: RequestMethod.POST },
      );
  }
}
