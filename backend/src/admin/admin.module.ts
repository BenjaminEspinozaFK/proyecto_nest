import {
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { LoggerMiddleware } from 'src/user/logger/logger.middleware';
import { JwtStrategy } from '../auth/jwt.strategy';
import { PassportModule } from '@nestjs/passport';
import { RolesGuard } from 'src/auth/roles.guard';
import { EmailModule } from '../email/email.module';
import { ADMIN_REPOSITORY } from './admin.tokens';
import { PrismaAdminRepository } from './infrastructure/prisma-admin.repository';

@Module({
  imports: [PassportModule, EmailModule],
  controllers: [AdminController],
  providers: [
    AdminService,
    { provide: ADMIN_REPOSITORY, useClass: PrismaAdminRepository },
    JwtStrategy,
    RolesGuard,
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
