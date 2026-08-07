import { UnauthorizedException } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { NotificationsRepositoryPort } from './domain/notification.repository';
import { Notification } from './domain/notification.types';

describe('NotificationsService', () => {
  let service: NotificationsService;
  let repository: jest.Mocked<NotificationsRepositoryPort>;

  const mockNotification: Notification = {
    id: 'notif-1',
    userId: 'user-1',
    adminId: null,
    title: 'Título',
    message: 'Mensaje',
    type: 'info',
    link: null,
    read: false,
    createdAt: new Date(),
  };

  beforeEach(() => {
    repository = {
      create: jest.fn(),
      createMany: jest.fn(),
      findAllAdminIds: jest.fn(),
      listForOwner: jest.fn(),
      countUnread: jest.fn(),
      findById: jest.fn(),
      markAsRead: jest.fn(),
      markAllAsRead: jest.fn(),
    };
    service = new NotificationsService(repository);
  });

  describe('notifyUser', () => {
    it('debe crear una notificación con los datos correctos', async () => {
      repository.create.mockResolvedValue(mockNotification);

      const result = await service.notifyUser(
        'user-1',
        'Título',
        'Mensaje',
        '/link',
        'success',
      );

      expect(repository.create).toHaveBeenCalledWith({
        userId: 'user-1',
        title: 'Título',
        message: 'Mensaje',
        link: '/link',
        type: 'success',
      });
      expect(result).toEqual(mockNotification);
    });

    it('debe usar tipo por defecto "info" y sin link si no se pasan', async () => {
      repository.create.mockResolvedValue(mockNotification);

      await service.notifyUser('user-1', 'Título', 'Mensaje');

      expect(repository.create).toHaveBeenCalledWith({
        userId: 'user-1',
        title: 'Título',
        message: 'Mensaje',
        link: undefined,
        type: 'info',
      });
    });
  });

  describe('notifyAllAdmins', () => {
    it('no debe llamar a createMany si no hay admins', async () => {
      repository.findAllAdminIds.mockResolvedValue([]);

      await service.notifyAllAdmins('Título', 'Mensaje');

      expect(repository.findAllAdminIds).toHaveBeenCalled();
      expect(repository.createMany).not.toHaveBeenCalled();
    });

    it('debe crear una notificación por cada admin', async () => {
      repository.findAllAdminIds.mockResolvedValue(['admin-1', 'admin-2']);

      await service.notifyAllAdmins('Título', 'Mensaje', '/admin', 'warning');

      expect(repository.createMany).toHaveBeenCalledWith([
        {
          adminId: 'admin-1',
          title: 'Título',
          message: 'Mensaje',
          link: '/admin',
          type: 'warning',
        },
        {
          adminId: 'admin-2',
          title: 'Título',
          message: 'Mensaje',
          link: '/admin',
          type: 'warning',
        },
      ]);
    });
  });

  describe('list', () => {
    it('debe listar las notificaciones del dueño', async () => {
      repository.listForOwner.mockResolvedValue([mockNotification]);

      const result = await service.list('user-1', 'user');

      expect(repository.listForOwner).toHaveBeenCalledWith('user-1', 'user');
      expect(result).toEqual([mockNotification]);
    });
  });

  describe('unreadCount', () => {
    it('debe devolver el conteo de no leídas', async () => {
      repository.countUnread.mockResolvedValue(3);

      const result = await service.unreadCount('user-1', 'user');

      expect(repository.countUnread).toHaveBeenCalledWith('user-1', 'user');
      expect(result).toEqual({ count: 3 });
    });
  });

  describe('markAsRead', () => {
    it('debe lanzar excepción si la notificación no existe', async () => {
      repository.findById.mockResolvedValue(null);

      await expect(
        service.markAsRead('notif-1', 'user-1', 'user'),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('debe rechazar si la notificación pertenece a otro usuario', async () => {
      repository.findById.mockResolvedValue({
        ...mockNotification,
        userId: 'otro-user',
      });

      await expect(
        service.markAsRead('notif-1', 'user-1', 'user'),
      ).rejects.toThrow(UnauthorizedException);
      expect(repository.markAsRead).not.toHaveBeenCalled();
    });

    it('debe rechazar si la notificación pertenece a otro admin', async () => {
      repository.findById.mockResolvedValue({
        ...mockNotification,
        userId: null,
        adminId: 'otro-admin',
      });

      await expect(
        service.markAsRead('notif-1', 'admin-1', 'admin'),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('debe marcar como leída si el admin es el dueño', async () => {
      repository.findById.mockResolvedValue({
        ...mockNotification,
        userId: null,
        adminId: 'admin-1',
      });
      repository.markAsRead.mockResolvedValue();

      const result = await service.markAsRead('notif-1', 'admin-1', 'admin');

      expect(repository.markAsRead).toHaveBeenCalledWith('notif-1');
      expect(result).toEqual({ message: 'Notificación marcada como leída' });
    });

    it('debe marcar como leída si el usuario es el dueño', async () => {
      repository.findById.mockResolvedValue(mockNotification);
      repository.markAsRead.mockResolvedValue();

      const result = await service.markAsRead('notif-1', 'user-1', 'user');

      expect(repository.markAsRead).toHaveBeenCalledWith('notif-1');
      expect(result).toEqual({ message: 'Notificación marcada como leída' });
    });
  });

  describe('markAllAsRead', () => {
    it('debe marcar todas como leídas y devolver mensaje', async () => {
      repository.markAllAsRead.mockResolvedValue();

      const result = await service.markAllAsRead('user-1', 'user');

      expect(repository.markAllAsRead).toHaveBeenCalledWith('user-1', 'user');
      expect(result).toEqual({
        message: 'Todas las notificaciones marcadas como leídas',
      });
    });
  });
});
