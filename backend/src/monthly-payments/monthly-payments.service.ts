import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CreateMonthlyPaymentDto } from './dto/create-monthly-payment.dto';
import { UpdateMonthlyPaymentDto } from './dto/update-monthly-payment.dto';

@Injectable()
export class MonthlyPaymentsService {
  constructor(private prisma: PrismaService) {}

  // Crear un registro de pago mensual
  async createPayment(
    createDto: CreateMonthlyPaymentDto,
    createdBy: string,
  ) {
    return this.prisma.monthlyPayment.create({
      data: {
        userId: createDto.userId,
        year: createDto.year,
        month: createDto.month,
        amount: createDto.amount,
        description: createDto.description,
        createdBy,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            rut: true,
          },
        },
      },
    });
  }

  // Obtener todos los pagos de un usuario
  async getUserPayments(userId: string) {
    return this.prisma.monthlyPayment.findMany({
      where: { userId },
      orderBy: [{ year: 'desc' }, { month: 'desc' }],
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            rut: true,
          },
        },
      },
    });
  }

  // Obtener pagos de un año específico
  async getUserPaymentsByYear(userId: string, year: number) {
    return this.prisma.monthlyPayment.findMany({
      where: {
        userId,
        year,
      },
      orderBy: { month: 'asc' },
    });
  }

  // Obtener el total pagado en un mes específico
  async getMonthTotal(userId: string, year: number, month: number) {
    const payment = await this.prisma.monthlyPayment.findUnique({
      where: {
        userId_year_month: {
          userId,
          year,
          month,
        },
      },
    });

    return payment?.amount || 0;
  }

  // Obtener el total pagado en un año
  async getYearTotal(userId: string, year: number) {
    const result = await this.prisma.monthlyPayment.aggregate({
      where: {
        userId,
        year,
      },
      _sum: {
        amount: true,
      },
    });

    return result._sum.amount || 0;
  }

  // Obtener el total histórico
  async getTotalPaid(userId: string) {
    const result = await this.prisma.monthlyPayment.aggregate({
      where: { userId },
      _sum: {
        amount: true,
      },
    });

    return result._sum.amount || 0;
  }

  // Actualizar un pago
  async updatePayment(id: string, updateDto: UpdateMonthlyPaymentDto) {
    return this.prisma.monthlyPayment.update({
      where: { id },
      data: updateDto,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            rut: true,
          },
        },
      },
    });
  }

  // Eliminar un pago
  async deletePayment(id: string) {
    return this.prisma.monthlyPayment.delete({
      where: { id },
    });
  }

  // Obtener resumen de pagos por año
  async getPaymentSummary(userId: string) {
    const payments = await this.prisma.monthlyPayment.findMany({
      where: { userId },
      orderBy: [{ year: 'desc' }, { month: 'desc' }],
    });

    // Agrupar por año
    const summary = payments.reduce(
      (acc, payment) => {
        if (!acc[payment.year]) {
          acc[payment.year] = {
            year: payment.year,
            total: 0,
            months: [],
          };
        }
        acc[payment.year].total += payment.amount;
        acc[payment.year].months.push({
          month: payment.month,
          amount: payment.amount,
          description: payment.description,
        });
        return acc;
      },
      {} as Record<
        number,
        { year: number; total: number; months: any[] }
      >,
    );

    return Object.values(summary);
  }
}
