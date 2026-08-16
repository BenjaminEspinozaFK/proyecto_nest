import {
  BadRequestException,
  ConflictException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { UsersService } from './user.service';
import { UserRepositoryPort } from './domain/user.repository';
import { User, UserPublic } from './domain/user.types';
import type { PaginatedResult } from '../common/interfaces/paginated-result.interface';

jest.mock('bcryptjs', () => ({
  hash: jest.fn().mockResolvedValue('hashed-password'),
  compare: jest.fn(),
}));

import * as bcrypt from 'bcryptjs';

describe('UsersService', () => {
  let service: UsersService;
  let repository: jest.Mocked<UserRepositoryPort>;

  const mockUser: User = {
    id: 'user-1',
    email: 'user@test.com',
    password: 'hashed-password',
    name: 'Usuario',
    rut: '12345678-9',
    phone: '98765432',
    address: null,
    comuna: null,
    role: 'user',
    avatar: null,
    lastLogin: null,
    requirePasswordChange: false,
    emailVerified: true,
    twoFactorEnabled: false,
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
  };

  const publicUser: UserPublic = (() => {
    const { password: _password, deletedAt: _deletedAt, ...rest } = mockUser;
    return rest;
  })();

  const paginatedUsers: PaginatedResult<UserPublic> = {
    data: [publicUser],
    meta: { total: 1, page: 1, limit: 10, totalPages: 1 },
  };

  beforeEach(() => {
    jest.clearAllMocks();
    repository = {
      findAll: jest.fn(),
      findById: jest.fn(),
      findByIdPublic: jest.fn(),
      findByEmail: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      updateAvatar: jest.fn(),
      updatePassword: jest.fn(),
      delete: jest.fn(),
    };
    service = new UsersService(repository);
  });

  describe('getUsers', () => {
    it('debe devolver los usuarios paginados', async () => {
      repository.findAll.mockResolvedValue(paginatedUsers);

      const result = await service.getUsers(1, 10);

      expect(repository.findAll).toHaveBeenCalledWith(1, 10);
      expect(result).toEqual(paginatedUsers);
    });
  });

  describe('getUserById', () => {
    it('debe devolver el usuario si existe', async () => {
      repository.findByIdPublic.mockResolvedValue(publicUser);

      const result = await service.getUserById('user-1');

      expect(repository.findByIdPublic).toHaveBeenCalledWith('user-1');
      expect(result).toEqual(publicUser);
    });

    it('debe lanzar NotFoundException si no existe', async () => {
      repository.findByIdPublic.mockResolvedValue(null);

      await expect(service.getUserById('user-1')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('createUser', () => {
    const createDto = {
      email: 'nuevo@test.com',
      password: 'Password123',
      name: 'Nuevo',
      rut: '12345678-9',
      phone: '98765432',
    };

    it('debe lanzar ConflictException si el email ya existe', async () => {
      repository.findByEmail.mockResolvedValue(mockUser);

      await expect(service.createUser(createDto)).rejects.toThrow(
        ConflictException,
      );
      expect(repository.create).not.toHaveBeenCalled();
    });

    it('debe encriptar la contraseña y crear el usuario', async () => {
      repository.findByEmail.mockResolvedValue(null);
      repository.create.mockResolvedValue(publicUser);

      const result = await service.createUser(createDto);

      expect(bcrypt.hash).toHaveBeenCalledWith('Password123', 10);
      expect(repository.create).toHaveBeenCalledWith({
        ...createDto,
        password: 'hashed-password',
      });
      expect(result).toEqual(publicUser);
    });
  });

  describe('updateUser', () => {
    it('debe lanzar NotFoundException si el usuario no existe', async () => {
      repository.findById.mockResolvedValue(null);

      await expect(
        service.updateUser('user-1', { name: 'Otro' }),
      ).rejects.toThrow(NotFoundException);
    });

    it('debe actualizar sin encriptar si no hay contraseña', async () => {
      repository.findById.mockResolvedValue(mockUser);
      repository.update.mockResolvedValue(publicUser);

      const result = await service.updateUser('user-1', { name: 'Otro' });

      expect(bcrypt.hash).not.toHaveBeenCalled();
      expect(repository.update).toHaveBeenCalledWith('user-1', {
        name: 'Otro',
      });
      expect(result).toEqual(publicUser);
    });

    it('debe encriptar la contraseña si se proporciona', async () => {
      repository.findById.mockResolvedValue(mockUser);
      repository.update.mockResolvedValue(publicUser);

      await service.updateUser('user-1', { password: 'Nueva123' });

      expect(bcrypt.hash).toHaveBeenCalledWith('Nueva123', 10);
      expect(repository.update).toHaveBeenCalledWith('user-1', {
        password: 'hashed-password',
      });
    });
  });

  describe('deleteUser', () => {
    it('debe lanzar NotFoundException si el usuario no existe', async () => {
      repository.findById.mockResolvedValue(null);

      await expect(service.deleteUser('user-1')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('debe eliminar el usuario y devolver un mensaje', async () => {
      repository.findById.mockResolvedValue(mockUser);
      repository.delete.mockResolvedValue();

      const result = await service.deleteUser('user-1');

      expect(repository.delete).toHaveBeenCalledWith('user-1');
      expect(result).toEqual({ message: 'Usuario con ID user-1 eliminado' });
    });
  });

  describe('updateAvatar', () => {
    it('debe construir la URL y actualizar el avatar', async () => {
      repository.updateAvatar.mockResolvedValue(publicUser);

      const result = await service.updateAvatar('user-1', 'foto.png');

      expect(repository.updateAvatar).toHaveBeenCalledWith(
        'user-1',
        '/uploads/avatars/foto.png',
      );
      expect(result).toEqual({
        user: publicUser,
        avatar: '/uploads/avatars/foto.png',
      });
    });
  });

  describe('changePassword', () => {
    const changePasswordDto = {
      currentPassword: 'Actual123',
      newPassword: 'Nueva123',
    };

    it('debe lanzar NotFoundException si el usuario no existe', async () => {
      repository.findById.mockResolvedValue(null);

      await expect(
        service.changePassword('user-1', changePasswordDto),
      ).rejects.toThrow(NotFoundException);
    });

    it('debe lanzar UnauthorizedException si la contraseña actual es incorrecta', async () => {
      repository.findById.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(
        service.changePassword('user-1', changePasswordDto),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('debe lanzar BadRequestException si la nueva contraseña es igual a la actual', async () => {
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      repository.findById.mockResolvedValue(mockUser);

      await expect(
        service.changePassword('user-1', {
          currentPassword: 'Actual123',
          newPassword: 'hashed-password',
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('debe encriptar la nueva contraseña y actualizarla', async () => {
      repository.findById.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock)
        .mockResolvedValueOnce(true)
        .mockResolvedValueOnce(false);
      repository.updatePassword.mockResolvedValue(publicUser);

      const result = await service.changePassword('user-1', changePasswordDto);

      expect(bcrypt.hash).toHaveBeenCalledWith('Nueva123', 10);
      expect(repository.updatePassword).toHaveBeenCalledWith(
        'user-1',
        'hashed-password',
        false,
      );
      expect(result.message).toContain('Contraseña actualizada');
    });
  });
});
