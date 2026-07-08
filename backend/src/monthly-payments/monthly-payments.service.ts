import { Inject, Injectable } from '@nestjs/common';
import { CreateMonthlyPaymentDto } from './dto/create-monthly-payment.dto';
import { UpdateMonthlyPaymentDto } from './dto/update-monthly-payment.dto';
import { MonthlyPaymentsRepositoryPort } from './domain/monthly-payment.repository';
import { MONTHLY_PAYMENTS_REPOSITORY } from './monthly-payments.tokens';
import { UpdateMonthlyPaymentInput } from './domain/monthly-payment.types';

@Injectable()
export class MonthlyPaymentsService {
  constructor(
    @Inject(MONTHLY_PAYMENTS_REPOSITORY)
    private monthlyPaymentsRepository: MonthlyPaymentsRepositoryPort,
  ) {}

  // Crear un registro de pago mensual
  async createPayment(createDto: CreateMonthlyPaymentDto, createdBy: string) {
    return this.monthlyPaymentsRepository.createPayment({
      userId: createDto.userId,
      year: createDto.year,
      month: createDto.month,
      amount: createDto.amount,
      description: createDto.description,
      createdBy,
    });
  }

  // Admin: Obtener todos los pagos del sistema
  async getAllPayments() {
    return this.monthlyPaymentsRepository.findAllPayments();
  }

  // Obtener todos los pagos de un usuario
  async getUserPayments(userId: string) {
    return this.monthlyPaymentsRepository.findUserPayments(userId);
  }

  // Obtener pagos de un año específico
  async getUserPaymentsByYear(userId: string, year: number) {
    return this.monthlyPaymentsRepository.findUserPaymentsByYear(userId, year);
  }

  // Obtener el total pagado en un mes específico
  async getMonthTotal(userId: string, year: number, month: number) {
    const payment =
      await this.monthlyPaymentsRepository.findPaymentByUserYearMonth(
        userId,
        year,
        month,
      );

    return payment?.amount || 0;
  }

  // Obtener el total pagado en un año
  async getYearTotal(userId: string, year: number) {
    return this.monthlyPaymentsRepository.sumUserYear(userId, year);
  }

  // Obtener el total histórico
  async getTotalPaid(userId: string) {
    return this.monthlyPaymentsRepository.sumUserTotal(userId);
  }

  // Actualizar un pago
  async updatePayment(id: string, updateDto: UpdateMonthlyPaymentDto) {
    const updateData: UpdateMonthlyPaymentInput = {
      amount: updateDto.amount,
      description: updateDto.description,
    };

    return this.monthlyPaymentsRepository.updatePayment(id, updateData);
  }

  // Eliminar un pago
  async deletePayment(id: string) {
    return this.monthlyPaymentsRepository.deletePayment(id);
  }

  // Obtener resumen de pagos por año
  async getPaymentSummary(userId: string) {
    const payments =
      await this.monthlyPaymentsRepository.findUserPaymentsForSummary(userId);

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
      {} as Record<number, { year: number; total: number; months: any[] }>,
    );

    return Object.values(summary);
  }
}
