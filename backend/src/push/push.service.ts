import { Inject, Injectable, Logger } from '@nestjs/common';
import * as webpush from 'web-push';
import { PushRepositoryPort } from './domain/push.repository';
import { PUSH_REPOSITORY } from './push.tokens';
import { PushPayload } from './domain/push.types';
import { SubscribePushDto } from './dto/subscribe-push.dto';

@Injectable()
export class PushService {
  private readonly logger = new Logger(PushService.name);

  constructor(
    @Inject(PUSH_REPOSITORY) private pushRepository: PushRepositoryPort,
  ) {
    webpush.setVapidDetails(
      process.env.VAPID_SUBJECT || 'mailto:admin@example.com',
      process.env.VAPID_PUBLIC_KEY || '',
      process.env.VAPID_PRIVATE_KEY || '',
    );
  }

  getPublicKey() {
    return { publicKey: process.env.VAPID_PUBLIC_KEY || '' };
  }

  async subscribe(
    ownerId: string,
    role: string,
    dto: SubscribePushDto,
  ) {
    await this.pushRepository.upsertSubscription({
      ...(role === 'admin' ? { adminId: ownerId } : { userId: ownerId }),
      endpoint: dto.endpoint,
      p256dh: dto.keys.p256dh,
      auth: dto.keys.auth,
    });

    return { message: 'Suscripción registrada correctamente' };
  }

  async unsubscribe(endpoint: string) {
    await this.pushRepository.deleteByEndpoint(endpoint);
    return { message: 'Suscripción eliminada' };
  }

  async sendToUser(userId: string, payload: PushPayload) {
    const subscriptions = await this.pushRepository.findByOwner(
      userId,
      'user',
    );
    await this.sendToSubscriptions(subscriptions, payload);
  }

  async sendToAdmins(payload: PushPayload) {
    const subscriptions =
      await this.pushRepository.findAllAdminSubscriptions();
    await this.sendToSubscriptions(subscriptions, payload);
  }

  private async sendToSubscriptions(
    subscriptions: { endpoint: string; p256dh: string; auth: string }[],
    payload: PushPayload,
  ) {
    const body = JSON.stringify(payload);

    await Promise.all(
      subscriptions.map(async (sub) => {
        try {
          await webpush.sendNotification(
            {
              endpoint: sub.endpoint,
              keys: { p256dh: sub.p256dh, auth: sub.auth },
            },
            body,
          );
        } catch (error: any) {
          if (error.statusCode === 404 || error.statusCode === 410) {
            await this.pushRepository.deleteByEndpoint(sub.endpoint);
          } else {
            this.logger.error(
              `Error enviando push a ${sub.endpoint}:`,
              error,
            );
          }
        }
      }),
    );
  }
}
