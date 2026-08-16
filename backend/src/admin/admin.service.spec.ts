import {
  BadRequestException,
  ConflictException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { AdminService } from './admin.service';
import { AdminRepositoryPort } from './domain/admin.repository';
import { AdminUserList } from './domain/admin.types';
import type { PaginatedResult } from '../common/interfaces/paginated-result.interface';
import { AuditLogService } from '../audit-log/audit-log.service';
import { EmailService } from '../email/email.service';
import type { Cache } from 'cache-manager';

jest.mock('bcryptjs', () => ({
  hash: jest.fn().mockResolvedValue('hashed-password'),
  compare: jest.fn(),
}));

jest.mock('xlsx', () => ({
  read: jest.fn(),
  utils: { sheet_to_json: jest.fn() },
}));

import * as bcrypt from 'bcryptjs';
import * as XLSX from 'xlsx';

describe('AdminService', () => {
  let service: AdminService;
  let adminRepository: jest.Mocked<AdminRepositoryPort>;
  let emailService: jest.Mocked<EmailService>;
  let auditLogService: jest.Mocked<AuditLogService>;
  let cacheManager: jest.Mocked<Cache>;

  const actingAdmin = { id: 'admin-1', name: 'Admin Uno' };
  const adminPublic = {
    id: 'admin-1',
    email: 'admin@test.com',
    name: 'Admin Uno',
    rut: '12345678-9',
    phone: '98765432',
    role: 'admin',
    avatar: null,
    lastLogin: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  const userExists = {
    id: 'user-1',
    email: 'user@test.com',
    name: 'Usuario',
    rut: '12345678-9',
    phone: '98765432',
    role: 'user',
    requirePasswordChange: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    adminRepository = {
      findAdmins: jest.fn(),
      findAdminById: jest.fn(),
      findAdminByEmail: jest.fn(),
      findAdminAuthById: jest.fn(),
      createAdmin: jest.fn(),
      updateAdmin: jest.fn(),
      updateAdminAvatar: jest.fn(),
      updateAdminPassword: jest.fn(),
      deleteAdmin: jest.fn(),
      countUsers: jest.fn(),
      countAdmins: jest.fn(),
      countUsersCreatedAfter: jest.fn(),
      findRecentUsers: jest.fn(),
      findRecentLogins: jest.fn(),
      groupUsersByRole: jest.fn(),
      findAllUsers: jest.fn(),
      findUserById: jest.fn(),
      findUserByEmail: jest.fn(),
      createUserByAdmin: jest.fn(),
      updateUserByAdmin: jest.fn(),
      deleteUser: jest.fn(),
    };
    emailService = {
      sendPasswordSetupEmail: jest.fn().mockResolvedValue(undefined),
    } as any;
    auditLogService = { log: jest.fn().mockResolvedValue(undefined) } as any;
    cacheManager = {
      get: jest.fn(),
      set: jest.fn(),
      del: jest.fn().mockResolvedValue(true),
    } as any;
    service = new AdminService(
      adminRepository,
      emailService,
      auditLogService,
      cacheManager,
    );
  });

  describe('getAdmins', () => {
    it('devuelve todos los admins', async () => {
      adminRepository.findAdmins.mockResolvedValue([adminPublic]);

      const result = await service.getAdmins();

      expect(result).toEqual([adminPublic]);
    });
  });

  describe('getAdminById', () => {
    it('devuelve el admin si existe', async () => {
      adminRepository.findAdminById.mockResolvedValue(adminPublic);

      const result = await service.getAdminById('admin-1');

      expect(result).toEqual(adminPublic);
    });

    it('lanza NotFoundException si no existe', async () => {
      adminRepository.findAdminById.mockResolvedValue(null);

      await expect(service.getAdminById('admin-1')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('createAdmin', () => {
    const createAdminDto = {
      email: 'nuevo-admin@test.com',
      password: 'Pass123!',
      name: 'Nuevo Admin',
      rut: '12345678-9',
    };

    it('lanza ConflictException si el email ya existe', async () => {
      adminRepository.findAdminByEmail.mockResolvedValue(adminPublic);

      await expect(
        service.createAdmin(createAdminDto, actingAdmin),
      ).rejects.toThrow(ConflictException);
    });

    it('encripta la contraseña, crea el admin y registra auditoría', async () => {
      adminRepository.findAdminByEmail.mockResolvedValue(null);
      adminRepository.createAdmin.mockResolvedValue(adminPublic);

      const result = await service.createAdmin(createAdminDto, actingAdmin);

      expect(bcrypt.hash).toHaveBeenCalledWith('Pass123!', 10);
      expect(adminRepository.createAdmin).toHaveBeenCalledWith({
        ...createAdminDto,
        password: 'hashed-password',
      });
      expect(auditLogService.log).toHaveBeenCalledWith(
        'admin-1',
        'Admin Uno',
        'admin.create',
        'Admin',
        expect.stringContaining('admin@test.com'),
        adminPublic.id,
      );
      expect(cacheManager.del).toHaveBeenCalledWith('admin:stats');
      expect(result).toEqual(adminPublic);
    });
  });

  describe('updateAdmin', () => {
    it('lanza NotFoundException si el admin no existe', async () => {
      adminRepository.findAdminById.mockResolvedValue(null);

      await expect(
        service.updateAdmin('admin-1', { name: 'Otro' }, actingAdmin),
      ).rejects.toThrow(NotFoundException);
    });

    it('actualiza y encripta la contraseña si se provee', async () => {
      adminRepository.findAdminById.mockResolvedValue(adminPublic);
      adminRepository.updateAdmin.mockResolvedValue({
        ...adminPublic,
        name: 'Otro',
      });

      const result = await service.updateAdmin(
        'admin-1',
        { name: 'Otro', password: 'Nueva123' },
        actingAdmin,
      );

      expect(bcrypt.hash).toHaveBeenCalledWith('Nueva123', 10);
      expect(adminRepository.updateAdmin).toHaveBeenCalledWith('admin-1', {
        name: 'Otro',
        password: 'hashed-password',
      });
      expect(cacheManager.del).toHaveBeenCalledWith('admin:stats');
      expect(result.name).toBe('Otro');
    });
  });

  describe('deleteAdmin', () => {
    it('lanza NotFoundException si el admin no existe', async () => {
      adminRepository.findAdminById.mockResolvedValue(null);

      await expect(service.deleteAdmin('admin-1', actingAdmin)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('elimina el admin y registra auditoría', async () => {
      adminRepository.findAdminById.mockResolvedValue(adminPublic);
      adminRepository.deleteAdmin.mockResolvedValue();

      const result = await service.deleteAdmin('admin-1', actingAdmin);

      expect(adminRepository.deleteAdmin).toHaveBeenCalledWith('admin-1');
      expect(auditLogService.log).toHaveBeenCalledWith(
        'admin-1',
        'Admin Uno',
        'admin.delete',
        'Admin',
        expect.stringContaining('admin@test.com'),
        'admin-1',
      );
      expect(result).toEqual({ message: 'Admin con ID admin-1 eliminado' });
    });
  });

  describe('getStats', () => {
    it('devuelve las estadísticas cacheadas si existen', async () => {
      const cached = { totalUsers: 10 };
      cacheManager.get.mockResolvedValue(cached);

      const result = await service.getStats();

      expect(result).toEqual(cached);
      expect(adminRepository.countUsers).not.toHaveBeenCalled();
    });

    it('calcula y cachea las estadísticas', async () => {
      cacheManager.get.mockResolvedValue(null);
      adminRepository.countUsers.mockResolvedValue(10);
      adminRepository.countAdmins.mockResolvedValue(2);
      adminRepository.countUsersCreatedAfter.mockResolvedValue(1);
      adminRepository.findRecentUsers.mockResolvedValue([]);
      adminRepository.findRecentLogins.mockResolvedValue([]);
      adminRepository.groupUsersByRole.mockResolvedValue([
        { role: 'user', count: 10 },
      ]);

      const result: any = await service.getStats();

      expect(result.totalUsers).toBe(10);
      expect(result.totalAdmins).toBe(2);
      expect(result.usersToday).toBe(1);
      expect(cacheManager.set).toHaveBeenCalledWith(
        'admin:stats',
        result,
        60_000,
      );
    });
  });

  describe('getAllUsers', () => {
    it('devuelve los usuarios paginados', async () => {
      const paginated: PaginatedResult<AdminUserList> = {
        data: [userExists],
        meta: { total: 1, page: 1, limit: 10, totalPages: 1 },
      };
      adminRepository.findAllUsers.mockResolvedValue(paginated);

      const result = await service.getAllUsers(1, 10);

      expect(adminRepository.findAllUsers).toHaveBeenCalledWith(1, 10);
      expect(result).toEqual(paginated);
    });
  });

  describe('updateUser', () => {
    it('lanza NotFoundException si el usuario no existe', async () => {
      adminRepository.findUserById.mockResolvedValue(null);

      await expect(
        service.updateUser('user-1', { name: 'Otro' }, actingAdmin),
      ).rejects.toThrow(NotFoundException);
    });

    it('actualiza solo los campos definidos', async () => {
      adminRepository.findUserById.mockResolvedValue(userExists);
      adminRepository.updateUserByAdmin.mockResolvedValue({
        ...userExists,
        name: 'Actualizado',
      });

      const result = await service.updateUser(
        'user-1',
        { name: 'Actualizado', role: 'admin' },
        actingAdmin,
      );

      expect(adminRepository.updateUserByAdmin).toHaveBeenCalledWith('user-1', {
        name: 'Actualizado',
        role: 'admin',
      });
      expect(auditLogService.log).toHaveBeenCalled();
      expect(result.name).toBe('Actualizado');
    });
  });

  describe('deleteUser', () => {
    it('lanza NotFoundException si el usuario no existe', async () => {
      adminRepository.findUserById.mockResolvedValue(null);

      await expect(service.deleteUser('user-1', actingAdmin)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('elimina el usuario y registra auditoría', async () => {
      adminRepository.findUserById.mockResolvedValue(userExists);
      adminRepository.deleteUser.mockResolvedValue();

      const result = await service.deleteUser('user-1', actingAdmin);

      expect(adminRepository.deleteUser).toHaveBeenCalledWith('user-1');
      expect(auditLogService.log).toHaveBeenCalled();
      expect(result).toEqual({ message: 'Usuario con ID user-1 eliminado' });
    });
  });

  describe('updateAvatar', () => {
    it('actualiza el avatar del admin', async () => {
      adminRepository.updateAdminAvatar.mockResolvedValue(adminPublic);

      const result = await service.updateAvatar('admin-1', 'foto.png');

      expect(adminRepository.updateAdminAvatar).toHaveBeenCalledWith(
        'admin-1',
        '/uploads/avatars/foto.png',
      );
      expect(result.avatar).toBe('/uploads/avatars/foto.png');
    });
  });

  describe('createUser', () => {
    it('lanza ConflictException si el email ya existe', async () => {
      adminRepository.findUserByEmail.mockResolvedValue(userExists);

      await expect(
        service.createUser(
          { email: 'user@test.com', password: 'X', name: 'X', rut: '1-1' },
          actingAdmin,
        ),
      ).rejects.toThrow(ConflictException);
    });

    it('crea un usuario con contraseña proporcionada sin enviar email', async () => {
      adminRepository.findUserByEmail.mockResolvedValue(null);
      adminRepository.createUserByAdmin.mockResolvedValue({
        ...userExists,
        requirePasswordChange: false,
      });

      const result = await service.createUser(
        {
          email: 'nuevo@test.com',
          password: 'Temp1234',
          name: 'Nuevo',
          rut: '12345678-9',
          role: 'user',
        },
        actingAdmin,
      );

      expect(emailService.sendPasswordSetupEmail).not.toHaveBeenCalled();
      expect(auditLogService.log).toHaveBeenCalled();
      expect(cacheManager.del).toHaveBeenCalledWith('admin:stats');
      expect(result.id).toBe('user-1');
    });

    it('genera contraseña temporal y envía email si no se provee', async () => {
      adminRepository.findUserByEmail.mockResolvedValue(null);
      adminRepository.createUserByAdmin.mockResolvedValue({
        ...userExists,
        requirePasswordChange: true,
      });

      const result = await service.createUser(
        { email: 'nuevo@test.com', name: 'Nuevo', rut: '12345678-9' },
        actingAdmin,
      );

      expect(emailService.sendPasswordSetupEmail).toHaveBeenCalledWith(
        'user@test.com',
        'Usuario',
        expect.any(String),
      );
      expect(adminRepository.createUserByAdmin).toHaveBeenCalledWith(
        expect.objectContaining({ requirePasswordChange: true }),
      );
      expect(result.id).toBe('user-1');
    });

    it('encripta la contraseña temporal generada', async () => {
      adminRepository.findUserByEmail.mockResolvedValue(null);
      adminRepository.createUserByAdmin.mockResolvedValue(userExists);

      await service.createUser(
        { email: 'nuevo@test.com', name: 'Nuevo', rut: '12345678-9' },
        actingAdmin,
      );

      expect(bcrypt.hash).toHaveBeenCalledWith(expect.any(String), 10);
    });
  });

  describe('searchUserByEmail', () => {
    it('lanza NotFoundException si no encuentra el usuario', async () => {
      adminRepository.findUserByEmail.mockResolvedValue(null);

      await expect(service.searchUserByEmail('x@test.com')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('devuelve el usuario encontrado', async () => {
      adminRepository.findUserByEmail.mockResolvedValue(userExists);

      const result = await service.searchUserByEmail('user@test.com');

      expect(result).toEqual(userExists);
    });
  });

  describe('changePassword', () => {
    const dto = {
      currentPassword: 'Actual123',
      newPassword: 'Nueva123',
    };

    it('lanza NotFoundException si el admin no existe', async () => {
      adminRepository.findAdminAuthById.mockResolvedValue(null);

      await expect(service.changePassword('admin-1', dto)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('lanza UnauthorizedException si la contraseña actual es incorrecta', async () => {
      adminRepository.findAdminAuthById.mockResolvedValue({
        id: 'admin-1',
        password: 'hashed',
      });
      (bcrypt.compare as jest.Mock).mockResolvedValueOnce(false);

      await expect(service.changePassword('admin-1', dto)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('lanza BadRequestException si la nueva contraseña es igual a la actual', async () => {
      adminRepository.findAdminAuthById.mockResolvedValue({
        id: 'admin-1',
        password: 'hashed',
      });
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      await expect(service.changePassword('admin-1', dto)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('actualiza la contraseña del admin', async () => {
      adminRepository.findAdminAuthById.mockResolvedValue({
        id: 'admin-1',
        password: 'hashed',
      });
      (bcrypt.compare as jest.Mock)
        .mockResolvedValueOnce(true)
        .mockResolvedValueOnce(false);

      const result = await service.changePassword('admin-1', dto);

      expect(bcrypt.hash).toHaveBeenCalledWith('Nueva123', 10);
      expect(adminRepository.updateAdminPassword).toHaveBeenCalledWith(
        'admin-1',
        'hashed-password',
      );
      expect(result.message).toContain('actualizada');
    });
  });

  describe('bulkCreateUsersFromExcel', () => {
    const worksheet = { A1: { v: 'email' } };
    const workbook = { SheetNames: ['Sheet1'], Sheets: { Sheet1: worksheet } };
    (XLSX.read as jest.Mock).mockReturnValue(workbook);

    it('lanza BadRequestException si el Excel está vacío', async () => {
      (XLSX.utils.sheet_to_json as jest.Mock).mockReturnValue([]);

      await expect(
        service.bulkCreateUsersFromExcel(Buffer.from('x'), actingAdmin),
      ).rejects.toThrow(BadRequestException);
    });

    it('procesa filas válidas e inválidas sin fallar', async () => {
      (XLSX.utils.sheet_to_json as jest.Mock).mockReturnValue([
        { email: 'a@test.com', rut: '11111111-1', name: 'A' },
        { email: 'b@test.com', rut: '22222222-2', phone: '12345' },
        { email: '', rut: '33333333-3' },
      ]);
      adminRepository.findUserByEmail.mockResolvedValue(null);
      adminRepository.createUserByAdmin
        .mockResolvedValueOnce({ ...userExists, email: 'a@test.com' })
        .mockResolvedValueOnce({ ...userExists, email: 'b@test.com' });

      const result = await service.bulkCreateUsersFromExcel(
        Buffer.from('x'),
        actingAdmin,
      );

      expect(result.success.length).toBe(1);
      expect(result.errors.length).toBe(2);
      expect(auditLogService.log).toHaveBeenCalledWith(
        'admin-1',
        'Admin Uno',
        'user.bulk-create',
        'User',
        expect.stringContaining('1'),
      );
    });

    it('registra errores de filas con email duplicado', async () => {
      (XLSX.utils.sheet_to_json as jest.Mock).mockReturnValue([
        { email: 'a@test.com', rut: '11111111-1' },
      ]);
      adminRepository.findUserByEmail.mockResolvedValue(userExists);

      const result = await service.bulkCreateUsersFromExcel(
        Buffer.from('x'),
        actingAdmin,
      );

      expect(result.success.length).toBe(0);
      expect(result.errors.length).toBe(1);
      expect(result.errors[0].error).toContain('ya existe');
    });

    it('lanza BadRequestException si XLSX.read falla', async () => {
      (XLSX.read as jest.Mock).mockImplementation(() => {
        throw new Error('archivo corrupto');
      });

      await expect(
        service.bulkCreateUsersFromExcel(Buffer.from('x'), actingAdmin),
      ).rejects.toThrow(BadRequestException);
    });
  });
});
