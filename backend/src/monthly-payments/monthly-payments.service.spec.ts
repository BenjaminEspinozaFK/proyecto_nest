import { MonthlyPaymentsService } from './monthly-payments.service';
import { MonthlyPaymentsRepositoryPort } from './domain/monthly-payment.repository';
import { AuditLogService } from '../audit-log/audit-log.service';
import { MonthlyPayment } from './domain/monthly-payment.types';

describe('MonthlyPaymentsService', () => {
  let service: MonthlyPaymentsService;
  let monthlyPaymentsRepository: jest.Mocked<MonthlyPaymentsRepositoryPort>;
  let auditLogService: jest.Mocked<AuditLogService>;

  const mockPayment: MonthlyPayment = {
    id: 'pay-1',
    userId: 'user-1',
    year: 2026,
    month: 8,
    amount: 25000,
    description: 'Cuota de agosto',
    paymentDate: new Date(),
    createdAt: new Date(),
    updatedAt: new Date(),
    createdBy: 'admin-1',
    user: { id: 'user-1', name: 'Usuario', email: 'u@test.com', rut: '1-9' },
  };

  beforeEach(() => {
    jest.clearAllMocks();
    monthlyPaymentsRepository = {
      createPayment: jest.fn(),
      findAllPayments: jest.fn(),
      findUserPayments: jest.fn(),
      findUserPaymentsByYear: jest.fn(),
      findPaymentByUserYearMonth: jest.fn(),
      sumUserYear: jest.fn(),
      sumUserTotal: jest.fn(),
      updatePayment: jest.fn(),
      deletePayment: jest.fn(),
      findUserPaymentsForSummary: jest.fn(),
    };
    auditLogService = { log: jest.fn().mockResolvedValue(undefined) } as any;
    service = new MonthlyPaymentsService(
      monthlyPaymentsRepository,
      auditLogService,
    );
  });

  describe('createPayment', () => {
    it('crea el pago y registra auditoría', async () => {
      monthlyPaymentsRepository.createPayment.mockResolvedValue(mockPayment);

      const result = await service.createPayment(
        {
          userId: 'user-1',
          year: 2026,
          month: 8,
          amount: 25000,
          description: 'Cuota de agosto',
        },
        'admin-1',
        'Admin Uno',
      );

      expect(monthlyPaymentsRepository.createPayment).toHaveBeenCalledWith({
        userId: 'user-1',
        year: 2026,
        month: 8,
        amount: 25000,
        description: 'Cuota de agosto',
        createdBy: 'admin-1',
      });
      expect(auditLogService.log).toHaveBeenCalledWith(
        'admin-1',
        'Admin Uno',
        'payment.create',
        'MonthlyPayment',
        expect.stringContaining('25.000'),
        'pay-1',
      );
      expect(result).toEqual(mockPayment);
    });
  });

  describe('getAllPayments / getUserPayments / getUserPaymentsByYear', () => {
    it('devuelve todos los pagos', async () => {
      monthlyPaymentsRepository.findAllPayments.mockResolvedValue([
        mockPayment,
      ]);

      const result = await service.getAllPayments();

      expect(monthlyPaymentsRepository.findAllPayments).toHaveBeenCalled();
      expect(result).toEqual([mockPayment]);
    });

    it('devuelve los pagos de un usuario', async () => {
      monthlyPaymentsRepository.findUserPayments.mockResolvedValue([
        mockPayment,
      ]);

      const result = await service.getUserPayments('user-1');

      expect(monthlyPaymentsRepository.findUserPayments).toHaveBeenCalledWith(
        'user-1',
      );
      expect(result).toEqual([mockPayment]);
    });

    it('devuelve los pagos de un usuario en un año', async () => {
      monthlyPaymentsRepository.findUserPaymentsByYear.mockResolvedValue([
        mockPayment,
      ]);

      const result = await service.getUserPaymentsByYear('user-1', 2026);

      expect(
        monthlyPaymentsRepository.findUserPaymentsByYear,
      ).toHaveBeenCalledWith('user-1', 2026);
      expect(result).toEqual([mockPayment]);
    });
  });

  describe('getMonthTotal / getYearTotal / getTotalPaid', () => {
    it('devuelve el monto del mes existente', async () => {
      monthlyPaymentsRepository.findPaymentByUserYearMonth.mockResolvedValue(
        mockPayment,
      );

      const result = await service.getMonthTotal('user-1', 2026, 8);

      expect(
        monthlyPaymentsRepository.findPaymentByUserYearMonth,
      ).toHaveBeenCalledWith('user-1', 2026, 8);
      expect(result).toBe(25000);
    });

    it('devuelve 0 si no hay pago en ese mes', async () => {
      monthlyPaymentsRepository.findPaymentByUserYearMonth.mockResolvedValue(
        null,
      );

      const result = await service.getMonthTotal('user-1', 2026, 9);

      expect(result).toBe(0);
    });

    it('devuelve el total anual', async () => {
      monthlyPaymentsRepository.sumUserYear.mockResolvedValue(50000);

      const result = await service.getYearTotal('user-1', 2026);

      expect(monthlyPaymentsRepository.sumUserYear).toHaveBeenCalledWith(
        'user-1',
        2026,
      );
      expect(result).toBe(50000);
    });

    it('devuelve el total histórico', async () => {
      monthlyPaymentsRepository.sumUserTotal.mockResolvedValue(75000);

      const result = await service.getTotalPaid('user-1');

      expect(monthlyPaymentsRepository.sumUserTotal).toHaveBeenCalledWith(
        'user-1',
      );
      expect(result).toBe(75000);
    });
  });

  describe('updatePayment', () => {
    it('actualiza el pago y registra auditoría', async () => {
      const updated = { ...mockPayment, amount: 30000 };
      monthlyPaymentsRepository.updatePayment.mockResolvedValue(updated);

      const result = await service.updatePayment(
        'pay-1',
        { amount: 30000, description: 'Actualizado' },
        'admin-1',
        'Admin Uno',
      );

      expect(monthlyPaymentsRepository.updatePayment).toHaveBeenCalledWith(
        'pay-1',
        { amount: 30000, description: 'Actualizado' },
      );
      expect(auditLogService.log).toHaveBeenCalledWith(
        'admin-1',
        'Admin Uno',
        'payment.update',
        'MonthlyPayment',
        expect.stringContaining('30.000'),
        'pay-1',
      );
      expect(result).toEqual(updated);
    });
  });

  describe('deletePayment', () => {
    it('elimina el pago y registra auditoría', async () => {
      monthlyPaymentsRepository.deletePayment.mockResolvedValue(mockPayment);

      const result = await service.deletePayment(
        'pay-1',
        'admin-1',
        'Admin Uno',
      );

      expect(monthlyPaymentsRepository.deletePayment).toHaveBeenCalledWith(
        'pay-1',
      );
      expect(auditLogService.log).toHaveBeenCalledWith(
        'admin-1',
        'Admin Uno',
        'payment.delete',
        'MonthlyPayment',
        expect.stringContaining('25.000'),
        'pay-1',
      );
      expect(result).toEqual(mockPayment);
    });
  });

  describe('getPaymentSummary', () => {
    it('agrupa los pagos por año', async () => {
      monthlyPaymentsRepository.findUserPaymentsForSummary.mockResolvedValue([
        { ...mockPayment, year: 2025, month: 12, amount: 10000 },
        { ...mockPayment, year: 2026, month: 1, amount: 20000 },
        { ...mockPayment, year: 2026, month: 2, amount: 30000 },
      ]);

      const result = await service.getPaymentSummary('user-1');

      expect(
        monthlyPaymentsRepository.findUserPaymentsForSummary,
      ).toHaveBeenCalledWith('user-1');
      expect(result).toHaveLength(2);
      expect(result[0].year).toBe(2025);
      expect(result[0].total).toBe(10000);
      expect(result[0].months).toHaveLength(1);
      expect(result[1].year).toBe(2026);
      expect(result[1].total).toBe(50000);
      expect(result[1].months).toHaveLength(2);
    });

    it('devuelve un array vacío si no hay pagos', async () => {
      monthlyPaymentsRepository.findUserPaymentsForSummary.mockResolvedValue(
        [],
      );

      const result = await service.getPaymentSummary('user-1');

      expect(result).toEqual([]);
    });
  });
});
