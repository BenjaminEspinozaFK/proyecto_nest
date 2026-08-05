import { AuditLogService } from './audit-log.service';
import { AuditLogRepositoryPort } from './domain/audit-log.repository';

describe('AuditLogService', () => {
  let service: AuditLogService;
  let repository: jest.Mocked<AuditLogRepositoryPort>;

  beforeEach(() => {
    repository = {
      create: jest.fn(),
      list: jest.fn(),
      count: jest.fn(),
      distinctAdmins: jest.fn(),
    };
    service = new AuditLogService(repository);
  });

  describe('log', () => {
    it('debe pasar los datos al repositorio', async () => {
      repository.create.mockResolvedValue({
        id: 'log-1',
        adminId: 'admin-1',
        adminName: 'Admin',
        action: 'CREATE',
        entityType: 'User',
        entityId: 'user-1',
        description: 'Usuario creado',
        createdAt: new Date(),
      });

      await service.log(
        'admin-1',
        'Admin',
        'CREATE',
        'User',
        'Usuario creado',
        'user-1',
      );

      expect(repository.create).toHaveBeenCalledWith({
        adminId: 'admin-1',
        adminName: 'Admin',
        action: 'CREATE',
        entityType: 'User',
        entityId: 'user-1',
        description: 'Usuario creado',
      });
    });

    it('no debe lanzar excepción si el repositorio falla', async () => {
      repository.create.mockRejectedValue(new Error('DB error'));

      await expect(
        service.log('admin-1', 'Admin', 'DELETE', 'User', 'Error de prueba'),
      ).resolves.toBeUndefined();
    });
  });

  describe('list', () => {
    it('devolver una estructura paginada correcta', async () => {
      repository.list.mockResolvedValue([
        {
          id: 'log-1',
          adminId: 'admin-1',
          adminName: null,
          action: 'CREATE',
          entityType: 'User',
          entityId: 'user-1',
          description: 'Usuario creado',
          createdAt: new Date(),
        },
      ]);
      repository.count.mockResolvedValue(25);

      const result = await service.list({}, 1, 10);

      expect(repository.list).toHaveBeenCalledWith({}, 10, 0);
      expect(repository.count).toHaveBeenCalledWith({});
      expect(result).toEqual({
        items: expect.any(Array),
        total: 25,
        page: 1,
        pageSize: 10,
        totalPages: 3,
      });
    });

    it('declamp page mínima a 1', async () => {
      repository.list.mockResolvedValue([]);
      repository.count.mockResolvedValue(0);

      const result = await service.list({}, 0, 20);

      expect(result.page).toBe(1);
      expect(repository.list).toHaveBeenCalledWith({}, 20, 0);
    });

    it('debe limitar pageSize máximo a 100', async () => {
      repository.list.mockResolvedValue([]);
      repository.count.mockResolvedValue(0);

      const result = await service.list({}, 1, 500);

      expect(result.pageSize).toBe(100);
      expect(repository.list).toHaveBeenCalledWith({}, 100, 0);
    });

    it('debe calcular totalPages correctamente', async () => {
      repository.list.mockResolvedValue([]);
      repository.count.mockResolvedValue(25);

      const result = await service.list({}, 2, 10);

      expect(result.total).toBe(25);
      expect(result.page).toBe(2);
      expect(result.pageSize).toBe(10);
      expect(result.totalPages).toBe(3);
    });
  });

  describe('getFilterOptions', () => {
    it('debe devolver los admins distintos', async () => {
      repository.distinctAdmins.mockResolvedValue([
        { id: 'admin-1', name: 'Admin Uno' },
        { id: 'admin-2', name: null },
      ]);

      const result = await service.getFilterOptions();

      expect(repository.distinctAdmins).toHaveBeenCalled();
      expect(result).toEqual({
        admins: [
          { id: 'admin-1', name: 'Admin Uno' },
          { id: 'admin-2', name: null },
        ],
      });
    });
  });
});
