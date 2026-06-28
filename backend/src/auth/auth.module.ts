import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './jwt.strategy';
import { RolesGuard } from './roles.guard';
import { EmailModule } from '../email/email.module';
import { AUTH_REPOSITORY } from './auth.tokens';
import { PrismaAuthRepository } from './infrastructure/prisma-auth.repository';

@Module({
  imports: [
    PassportModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: '15m' },
    }),
    EmailModule,
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    { provide: AUTH_REPOSITORY, useClass: PrismaAuthRepository },
    JwtStrategy,
    RolesGuard,
  ],
  exports: [AuthService, JwtStrategy, RolesGuard, PassportModule, JwtModule],
})
export class AuthModule {}
