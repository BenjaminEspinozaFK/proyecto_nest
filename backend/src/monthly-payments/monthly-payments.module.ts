import { Module } from '@nestjs/common';
import { MonthlyPaymentsController } from './monthly-payments.controller';
import { MonthlyPaymentsService } from './monthly-payments.service';
import { AuthModule } from '../auth/auth.module';
import { MONTHLY_PAYMENTS_REPOSITORY } from './monthly-payments.tokens';
import { PrismaMonthlyPaymentsRepository } from './infrastructure/prisma-monthly-payments.repository';

@Module({
  imports: [AuthModule],
  controllers: [MonthlyPaymentsController],
  providers: [
    MonthlyPaymentsService,
    {
      provide: MONTHLY_PAYMENTS_REPOSITORY,
      useClass: PrismaMonthlyPaymentsRepository,
    },
  ],
  exports: [MonthlyPaymentsService],
})
export class MonthlyPaymentsModule {}
