import { Module } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { NotificationsController } from './notifications.controller';
import { NOTIFICATIONS_REPOSITORY } from './notifications.tokens';
import { PrismaNotificationsRepository } from './infrastructure/prisma-notifications.repository';

@Module({
  controllers: [NotificationsController],
  providers: [
    NotificationsService,
    {
      provide: NOTIFICATIONS_REPOSITORY,
      useClass: PrismaNotificationsRepository,
    },
  ],
  exports: [NotificationsService],
})
export class NotificationsModule {}
