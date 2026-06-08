import { Module } from '@nestjs/common';
import { AdminModule } from './admin/admin.module';
import { UsersModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { VouchersModule } from './vouchers/vouchers.module';
import { MonthlyPaymentsModule } from './monthly-payments/monthly-payments.module';
import { PrismaModule } from './prisma.module';

@Module({
  imports: [
    PrismaModule,
    AdminModule,
    UsersModule,
    AuthModule,
    VouchersModule,
    MonthlyPaymentsModule,
  ],
})
export class AppModule {}
