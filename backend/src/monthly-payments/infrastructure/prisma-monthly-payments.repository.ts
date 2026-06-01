import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { MonthlyPaymentsRepositoryPort } from '../domain/monthly-payment.repository';
import {
  CreateMonthlyPaymentInput,
  MonthlyPayment,
  UpdateMonthlyPaymentInput,
} from '../domain/monthly-payment.types';

@Injectable()
export class PrismaMonthlyPaymentsRepository
  implements MonthlyPaymentsRepositoryPort
{
  private userSelect = {
    id: true,
    name: true,
    email: true,
    rut: true,
  };

  constructor(private prisma: PrismaService) {}

  async createPayment(
    data: CreateMonthlyPaymentInput,
  ): Promise<MonthlyPayment> {
    return this.prisma.monthlyPayment.create({
      data: {
        userId: data.userId,
        year: data.year,
        month: data.month,
        amount: data.amount,
        description: data.description,
        createdBy: data.createdBy,
      },
      include: {
        user: { select: this.userSelect },
      },
    });
  }

  async findUserPayments(userId: string): Promise<MonthlyPayment[]> {
    return this.prisma.monthlyPayment.findMany({
      where: { userId },
      orderBy: [{ year: 'desc' }, { month: 'desc' }],
      include: {
        user: { select: this.userSelect },
      },
    });
  }

  async findUserPaymentsByYear(
    userId: string,
    year: number,
  ): Promise<MonthlyPayment[]> {
    return this.prisma.monthlyPayment.findMany({
      where: { userId, year },
      orderBy: { month: 'asc' },
    });
  }

  async findPaymentByUserYearMonth(
    userId: string,
    year: number,
    month: number,
  ): Promise<MonthlyPayment | null> {
    return this.prisma.monthlyPayment.findUnique({
      where: {
        userId_year_month: {
          userId,
          year,
          month,
        },
      },
    });
  }

  async sumUserYear(userId: string, year: number): Promise<number> {
    const result = await this.prisma.monthlyPayment.aggregate({
      where: { userId, year },
      _sum: { amount: true },
    });

    return result._sum.amount ?? 0;
  }

  async sumUserTotal(userId: string): Promise<number> {
    const result = await this.prisma.monthlyPayment.aggregate({
      where: { userId },
      _sum: { amount: true },
    });

    return result._sum.amount ?? 0;
  }

  async updatePayment(
    id: string,
    data: UpdateMonthlyPaymentInput,
  ): Promise<MonthlyPayment> {
    return this.prisma.monthlyPayment.update({
      where: { id },
      data,
      include: {
        user: { select: this.userSelect },
      },
    });
  }

  async deletePayment(id: string): Promise<MonthlyPayment> {
    return this.prisma.monthlyPayment.delete({
      where: { id },
    });
  }

  async findUserPaymentsForSummary(userId: string): Promise<MonthlyPayment[]> {
    return this.prisma.monthlyPayment.findMany({
      where: { userId },
      orderBy: [{ year: 'desc' }, { month: 'desc' }],
    });
  }
}
