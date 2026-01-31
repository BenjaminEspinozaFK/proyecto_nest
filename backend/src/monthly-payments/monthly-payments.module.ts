import { Module } from '@nestjs/common';
import { MonthlyPaymentsController } from './monthly-payments.controller';
import { MonthlyPaymentsService } from './monthly-payments.service';
import { PrismaService } from '../prisma.service';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthModule],
  controllers: [MonthlyPaymentsController],
  providers: [MonthlyPaymentsService, PrismaService],
  exports: [MonthlyPaymentsService],
})
export class MonthlyPaymentsModule {}
