import { VouchersService } from './vouchers.service';
import { VouchersRepositoryPort } from './domain/voucher.repository';
import { VouchersGateway } from './vouchers.gateway';
import { NotificationsService } from '../notifications/notifications.service';
import { PushService } from '../push/push.service';
import { AuditLogService } from '../audit-log/audit-log.service';
import { Voucher } from './domain/voucher.types';
import type { PaginatedResult } from '../common/interfaces/paginated-result.interface';
import type { Cache } from 'cache-manager';

describe('VouchersService', () => {
  let service: VouchersService;
  let vouchersRepository: jest.Mocked<VouchersRepositoryPort>;
  let vouchersGateway: jest.Mocked<VouchersGateway>;
  let notificationsService: jest.Mocked<NotificationsService>;
  let pushService: jest.Mocked<PushService>;
  let auditLogService: jest.Mocked<AuditLogService>;
  let cacheManager: jest.Mocked<Cache>;

  const mockVoucher: Voucher = {
    id: 'voucher-1',
    userId: 'user-1',
    kilos: 15,
    bank: 'Banco',
    status: 'pending',
    amount: null,
    notes: null,
    requestDate: new Date(),
    approvalDate: null,
    deliveredDate: null,
    approvedBy: null,
    user: { id: 'user-1', name: 'Usuario', email: 'u@test.com' },
  };

  beforeEach(() => {
    jest.clearAllMocks();
    vouchersRepository = {
      createVoucher: jest.fn(),
      findUserVouchers: jest.fn(),
      findPendingVouchers: jest.fn(),
      findAllVouchers: jest.fn(),
      getVoucherStats: jest.fn(),
      approveVoucher: jest.fn(),
      rejectVoucher: jest.fn(),
      markAsDelivered: jest.fn(),
      createManualVoucher: jest.fn(),
    };
    vouchersGateway = {
      notifyVoucherCreated: jest.fn(),
      notifyVoucherApproved: jest.fn(),
      notifyVoucherRejected: jest.fn(),
      notifyVoucherDelivered: jest.fn(),
      notifyNewNotification: jest.fn(),
      notifyVoucherUpdated: jest.fn(),
    } as any;
    notificationsService = {
      notifyAllAdmins: jest.fn().mockResolvedValue(undefined),
      notifyUser: jest.fn().mockResolvedValue(undefined),
    } as any;
    pushService = {
      sendToAdmins: jest.fn().mockResolvedValue(undefined),
      sendToUser: jest.fn().mockResolvedValue(undefined),
    } as any;
    auditLogService = { log: jest.fn().mockResolvedValue(undefined) } as any;
    cacheManager = {
      get: jest.fn(),
      set: jest.fn(),
      del: jest.fn().mockResolvedValue(true),
    } as any;
    service = new VouchersService(
      vouchersRepository,
      vouchersGateway,
      notificationsService,
      pushService,
      auditLogService,
      cacheManager,
    );
  });

  describe('requestVoucher', () => {
    it('crea el vale, notifica a los admins y envía push', async () => {
      vouchersRepository.createVoucher.mockResolvedValue(mockVoucher);

      const result = await service.requestVoucher('user-1', {
        kilos: 15,
        bank: 'Banco',
      });

      expect(vouchersRepository.createVoucher).toHaveBeenCalledWith(
        'user-1',
        15,
        'Banco',
      );
      expect(vouchersGateway.notifyVoucherCreated).toHaveBeenCalledWith(
        mockVoucher,
      );
      expect(notificationsService.notifyAllAdmins).toHaveBeenCalledWith(
        'Nueva solicitud de vale',
        expect.stringContaining('15 kg'),
        '/dashboard',
      );
      expect(vouchersGateway.notifyNewNotification).toHaveBeenCalledWith(
        'admin',
      );
      expect(pushService.sendToAdmins).toHaveBeenCalledWith({
        title: 'Nueva solicitud de vale',
        message: expect.any(String),
        link: '/dashboard',
      });
      expect(cacheManager.del).toHaveBeenCalled();
      expect(result).toEqual(mockVoucher);
    });

    it('no falla si el envío de push falla', async () => {
      const errorSpy = jest
        .spyOn(console, 'error')
        .mockImplementation(() => {});
      vouchersRepository.createVoucher.mockResolvedValue(mockVoucher);
      pushService.sendToAdmins.mockRejectedValue(new Error('push error'));

      const result = await service.requestVoucher('user-1', { kilos: 15 });

      expect(result).toEqual(mockVoucher);
      errorSpy.mockRestore();
    });
  });

  describe('getUserVouchers / getPendingVouchers / getAllVouchers', () => {
    it('devuelve los vales de un usuario', async () => {
      vouchersRepository.findUserVouchers.mockResolvedValue([mockVoucher]);

      const result = await service.getUserVouchers('user-1');

      expect(vouchersRepository.findUserVouchers).toHaveBeenCalledWith(
        'user-1',
      );
      expect(result).toEqual([mockVoucher]);
    });

    it('devuelve los vales pendientes', async () => {
      vouchersRepository.findPendingVouchers.mockResolvedValue([mockVoucher]);

      const result = await service.getPendingVouchers();

      expect(result).toEqual([mockVoucher]);
    });

    it('devuelve los vales paginados', async () => {
      const paginated: PaginatedResult<Voucher> = {
        data: [mockVoucher],
        meta: { total: 1, page: 1, limit: 10, totalPages: 1 },
      };
      vouchersRepository.findAllVouchers.mockResolvedValue(paginated);

      const result = await service.getAllVouchers(1, 10);

      expect(vouchersRepository.findAllVouchers).toHaveBeenCalledWith(1, 10);
      expect(result).toEqual(paginated);
    });
  });

  describe('approveVoucher', () => {
    const approvedVoucher = {
      ...mockVoucher,
      status: 'approved',
      amount: 25000,
    };

    it('aprueba el vale, notifica al usuario y registra auditoría', async () => {
      vouchersRepository.approveVoucher.mockResolvedValue(approvedVoucher);

      const result = await service.approveVoucher(
        'voucher-1',
        { amount: 25000, notes: 'ok' },
        'admin-1',
        'Admin Uno',
      );

      expect(vouchersRepository.approveVoucher).toHaveBeenCalledWith(
        'voucher-1',
        25000,
        'admin-1',
        'ok',
      );
      expect(vouchersGateway.notifyVoucherApproved).toHaveBeenCalledWith(
        approvedVoucher,
      );
      expect(auditLogService.log).toHaveBeenCalledWith(
        'admin-1',
        'Admin Uno',
        'voucher.approve',
        'GasVoucher',
        expect.stringContaining(`$${(25000).toLocaleString()}`),
        'voucher-1',
      );
      expect(notificationsService.notifyUser).toHaveBeenCalledWith(
        'user-1',
        'Vale aprobado',
        expect.stringContaining('15 kg'),
        '/dashboard',
      );
      expect(pushService.sendToUser).toHaveBeenCalledWith('user-1', {
        title: 'Vale aprobado',
        message: expect.any(String),
        link: '/dashboard',
      });
      expect(cacheManager.del).toHaveBeenCalled();
      expect(result).toEqual(approvedVoucher);
    });
  });

  describe('rejectVoucher', () => {
    const rejectedVoucher = { ...mockVoucher, status: 'rejected' };

    it('rechaza el vale y notifica al usuario', async () => {
      vouchersRepository.rejectVoucher.mockResolvedValue(rejectedVoucher);

      const result = await service.rejectVoucher(
        'voucher-1',
        { notes: 'documentos incompletos' },
        'admin-1',
        'Admin Uno',
      );

      expect(vouchersRepository.rejectVoucher).toHaveBeenCalledWith(
        'voucher-1',
        'admin-1',
        'documentos incompletos',
      );
      expect(vouchersGateway.notifyVoucherRejected).toHaveBeenCalledWith(
        rejectedVoucher,
      );
      expect(auditLogService.log).toHaveBeenCalledWith(
        'admin-1',
        'Admin Uno',
        'voucher.reject',
        'GasVoucher',
        expect.stringContaining('documentos incompletos'),
        'voucher-1',
      );
      expect(notificationsService.notifyUser).toHaveBeenCalledWith(
        'user-1',
        'Vale rechazado',
        expect.stringContaining('documentos incompletos'),
        '/dashboard',
      );
      expect(result).toEqual(rejectedVoucher);
    });
  });

  describe('bulkApproveVouchers', () => {
    it('aprueba los vales válidos y reporta los fallidos', async () => {
      const approvedVoucher = { ...mockVoucher, status: 'approved' };
      vouchersRepository.approveVoucher
        .mockResolvedValueOnce(approvedVoucher)
        .mockRejectedValueOnce(new Error('no encontrado'));

      const result = await service.bulkApproveVouchers(
        ['voucher-1', 'voucher-2'],
        25000,
        'admin-1',
        'ok',
        'Admin Uno',
      );

      expect(result.succeeded).toEqual(['voucher-1']);
      expect(result.failed).toEqual([
        { id: 'voucher-2', error: 'no encontrado' },
      ]);
    });
  });

  describe('bulkRejectVouchers', () => {
    it('rechaza los vales válidos y reporta los fallidos', async () => {
      const rejectedVoucher = { ...mockVoucher, status: 'rejected' };
      vouchersRepository.rejectVoucher
        .mockResolvedValueOnce(rejectedVoucher)
        .mockRejectedValueOnce(new Error('error'));

      const result = await service.bulkRejectVouchers(
        ['voucher-1', 'voucher-2'],
        'admin-1',
        'docs',
        'Admin Uno',
      );

      expect(result.succeeded).toEqual(['voucher-1']);
      expect(result.failed).toEqual([{ id: 'voucher-2', error: 'error' }]);
    });
  });

  describe('markAsDelivered', () => {
    const deliveredVoucher = { ...mockVoucher, status: 'delivered' };

    it('marca como entregado y notifica al usuario', async () => {
      vouchersRepository.markAsDelivered.mockResolvedValue(deliveredVoucher);

      const result = await service.markAsDelivered(
        'voucher-1',
        'admin-1',
        'Admin Uno',
      );

      expect(vouchersRepository.markAsDelivered).toHaveBeenCalledWith(
        'voucher-1',
      );
      expect(vouchersGateway.notifyVoucherDelivered).toHaveBeenCalledWith(
        deliveredVoucher,
      );
      expect(auditLogService.log).toHaveBeenCalledWith(
        'admin-1',
        'Admin Uno',
        'voucher.deliver',
        'GasVoucher',
        expect.stringContaining('entregado'),
        'voucher-1',
      );
      expect(notificationsService.notifyUser).toHaveBeenCalledWith(
        'user-1',
        'Vale entregado',
        expect.stringContaining('15 kg'),
        '/dashboard',
      );
      expect(cacheManager.del).toHaveBeenCalled();
      expect(result).toEqual(deliveredVoucher);
    });
  });

  describe('createManualVoucher', () => {
    it('crea un vale manual y registra auditoría', async () => {
      vouchersRepository.createManualVoucher.mockResolvedValue(mockVoucher);

      const result = await service.createManualVoucher(
        'user-1',
        15,
        25000,
        'admin-1',
        'sin notas',
        'Admin Uno',
      );

      expect(vouchersRepository.createManualVoucher).toHaveBeenCalledWith(
        'user-1',
        15,
        25000,
        'admin-1',
        'sin notas',
      );
      expect(auditLogService.log).toHaveBeenCalledWith(
        'admin-1',
        'Admin Uno',
        'voucher.manual-create',
        'GasVoucher',
        expect.stringContaining(`$${(25000).toLocaleString()}`),
        'voucher-1',
      );
      expect(cacheManager.del).toHaveBeenCalled();
      expect(result).toEqual(mockVoucher);
    });
  });

  describe('getUserVoucherStats', () => {
    it('calcula las estadísticas del usuario', async () => {
      vouchersRepository.findUserVouchers.mockResolvedValue([
        { ...mockVoucher, status: 'pending' },
        { ...mockVoucher, status: 'approved', amount: 10000 },
        { ...mockVoucher, status: 'approved', amount: 15000 },
        { ...mockVoucher, status: 'delivered' },
        { ...mockVoucher, status: 'rejected' },
      ]);

      const result = await service.getUserVoucherStats('user-1');

      expect(result).toEqual({
        total: 5,
        pending: 1,
        approved: 2,
        delivered: 1,
        rejected: 1,
        totalAmount: 25000,
      });
    });
  });

  describe('getGeneralStats', () => {
    it('devuelve las estadísticas cacheadas si existen', async () => {
      const cached = { total: 5 };
      cacheManager.get.mockResolvedValue(cached);

      const result = await service.getGeneralStats();

      expect(vouchersRepository.getVoucherStats).not.toHaveBeenCalled();
      expect(result).toEqual(cached);
    });

    it('calcula y cachea las estadísticas', async () => {
      cacheManager.get.mockResolvedValue(null);
      const stats = {
        total: 5,
        pending: 1,
        approved: 2,
        delivered: 1,
        rejected: 1,
        totalAmount: 100,
        thisMonth: 2,
      };
      vouchersRepository.getVoucherStats.mockResolvedValue(stats);

      const result = await service.getGeneralStats();

      expect(vouchersRepository.getVoucherStats).toHaveBeenCalled();
      expect(cacheManager.set).toHaveBeenCalledWith(
        'vouchers:stats:general',
        stats,
        60_000,
      );
      expect(result).toEqual(stats);
    });
  });
});
