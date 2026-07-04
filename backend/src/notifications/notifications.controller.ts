import { Controller, Get, Patch, Param, UseGuards, Req } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RequestWithUser } from '../auth/interfaces/request-with-user.interface';

@Controller('notifications')
@UseGuards(JwtAuthGuard)
export class NotificationsController {
  constructor(private notificationsService: NotificationsService) {}

  @Get()
  async list(@Req() req: RequestWithUser) {
    return this.notificationsService.list(req.user.userId, req.user.role);
  }

  @Get('unread-count')
  async unreadCount(@Req() req: RequestWithUser) {
    return this.notificationsService.unreadCount(
      req.user.userId,
      req.user.role,
    );
  }

  @Patch('read-all')
  async markAllAsRead(@Req() req: RequestWithUser) {
    return this.notificationsService.markAllAsRead(
      req.user.userId,
      req.user.role,
    );
  }

  @Patch(':id/read')
  async markAsRead(@Param('id') id: string, @Req() req: RequestWithUser) {
    return this.notificationsService.markAsRead(
      id,
      req.user.userId,
      req.user.role,
    );
  }
}
