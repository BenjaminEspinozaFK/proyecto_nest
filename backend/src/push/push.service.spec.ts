import * as webpush from 'web-push';
import { PushService } from './push.service';
import { PushRepositoryPort } from './domain/push.repository';

jest.mock('web-push', () => ({
  __esModule: true,
  setVapidDetails: jest.fn(),
  sendNotification: jest.fn().mockResolvedValue({}),
}));

describe('PushService', () => {
  let service: PushService;
  let pushRepository: jest.Mocked<PushRepositoryPort>;

  const mockSubscription = {
    id: 'sub-1',
    userId: 'user-1',
    adminId: null,
    endpoint: 'https://push.example.com/endpoint',
    p256dh: 'p256dh-key',
    auth: 'auth-key',
    createdAt: new Date(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    pushRepository = {
      upsertSubscription: jest.fn(),
      deleteByEndpoint: jest.fn(),
      findByOwner: jest.fn(),
      findAllAdminSubscriptions: jest.fn(),
    };
    service = new PushService(pushRepository);
  });

  describe('constructor', () => {
    it('configura las credenciales VAPID', () => {
      expect(webpush.setVapidDetails).toHaveBeenCalledWith(
        expect.any(String),
        expect.any(String),
        expect.any(String),
      );
    });
  });

  describe('getPublicKey', () => {
    it('devuelve la clave pública VAPID', () => {
      const result = service.getPublicKey();

      expect(result.publicKey).toBeDefined();
    });
  });

  describe('subscribe', () => {
    const dto = {
      endpoint: 'https://push.example.com/endpoint',
      keys: { p256dh: 'p256dh-key', auth: 'auth-key' },
    };

    it('registra una suscripción para un usuario', async () => {
      pushRepository.upsertSubscription.mockResolvedValue(mockSubscription);

      const result = await service.subscribe('user-1', 'user', dto);

      expect(pushRepository.upsertSubscription).toHaveBeenCalledWith({
        userId: 'user-1',
        endpoint: dto.endpoint,
        p256dh: 'p256dh-key',
        auth: 'auth-key',
      });
      expect(result.message).toContain('registrada');
    });

    it('registra una suscripción para un admin', async () => {
      pushRepository.upsertSubscription.mockResolvedValue(mockSubscription);

      await service.subscribe('admin-1', 'admin', dto);

      expect(pushRepository.upsertSubscription).toHaveBeenCalledWith(
        expect.objectContaining({ adminId: 'admin-1' }),
      );
    });
  });

  describe('unsubscribe', () => {
    it('elimina la suscripción por endpoint', async () => {
      pushRepository.deleteByEndpoint.mockResolvedValue();

      const result = await service.unsubscribe(
        'https://push.example.com/endpoint',
      );

      expect(pushRepository.deleteByEndpoint).toHaveBeenCalledWith(
        'https://push.example.com/endpoint',
      );
      expect(result.message).toContain('eliminada');
    });
  });

  describe('sendToUser', () => {
    const payload = { title: 'Título', message: 'Mensaje', link: '/x' };

    it('envía la notificación a las suscripciones del usuario', async () => {
      pushRepository.findByOwner.mockResolvedValue([mockSubscription]);

      await service.sendToUser('user-1', payload);

      expect(pushRepository.findByOwner).toHaveBeenCalledWith('user-1', 'user');
      expect(webpush.sendNotification).toHaveBeenCalledWith(
        {
          endpoint: mockSubscription.endpoint,
          keys: { p256dh: 'p256dh-key', auth: 'auth-key' },
        },
        JSON.stringify(payload),
      );
    });

    it('elimina la suscripción si devuelve 404', async () => {
      pushRepository.findByOwner.mockResolvedValue([mockSubscription]);
      const error = Object.assign(new Error('gone'), { statusCode: 410 });
      (webpush.sendNotification as jest.Mock).mockRejectedValueOnce(error);

      await service.sendToUser('user-1', payload);

      expect(pushRepository.deleteByEndpoint).toHaveBeenCalledWith(
        mockSubscription.endpoint,
      );
    });

    it('no elimina la suscripción para otros errores', async () => {
      pushRepository.findByOwner.mockResolvedValue([mockSubscription]);
      (webpush.sendNotification as jest.Mock).mockRejectedValueOnce(
        new Error('network error'),
      );

      await service.sendToUser('user-1', payload);

      expect(pushRepository.deleteByEndpoint).not.toHaveBeenCalled();
    });

    it('no envía nada si el usuario no tiene suscripciones', async () => {
      pushRepository.findByOwner.mockResolvedValue([]);

      await service.sendToUser('user-1', payload);

      expect(webpush.sendNotification).not.toHaveBeenCalled();
    });
  });

  describe('sendToAdmins', () => {
    const payload = { title: 'Título', message: 'Mensaje' };

    it('envía a todas las suscripciones de admins', async () => {
      pushRepository.findAllAdminSubscriptions.mockResolvedValue([
        { ...mockSubscription, adminId: 'admin-1', userId: null },
      ]);

      await service.sendToAdmins(payload);

      expect(pushRepository.findAllAdminSubscriptions).toHaveBeenCalled();
      expect(webpush.sendNotification).toHaveBeenCalledWith(
        expect.objectContaining({ endpoint: mockSubscription.endpoint }),
        JSON.stringify(payload),
      );
    });
  });
});
