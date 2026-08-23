import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { envValidationSchema } from './config/env.validation';
import { AdminModule } from './admin/admin.module';
import { UsersModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { VouchersModule } from './vouchers/vouchers.module';
import { MonthlyPaymentsModule } from './monthly-payments/monthly-payments.module';
import { NotificationsModule } from './notifications/notifications.module';
import { PushModule } from './push/push.module';
import { AuditLogModule } from './audit-log/audit-log.module';
import { PrismaModule } from './prisma.module';
import { RedisCacheModule } from './cache/redis-cache.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: envValidationSchema,
      validationOptions: {
        abortEarly: false,
      },
    }),
    ThrottlerModule.forRoot([
      {
        name: 'default',
        ttl: 60_000,
        limit: 100,
      },
    ]),
    RedisCacheModule,
    PrismaModule,
    AdminModule,
    UsersModule,
    AuthModule,
    VouchersModule,
    MonthlyPaymentsModule,
    NotificationsModule,
    PushModule,
    AuditLogModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
