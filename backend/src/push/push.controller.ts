import {
  Controller,
  Get,
  Post,
  Body,
  ValidationPipe,
  UseGuards,
  Req,
} from '@nestjs/common';
import { PushService } from './push.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RequestWithUser } from '../auth/interfaces/request-with-user.interface';
import { SubscribePushDto, UnsubscribePushDto } from './dto/subscribe-push.dto';

@Controller('push')
export class PushController {
  constructor(private pushService: PushService) {}

  @Get('vapid-public-key')
  getPublicKey() {
    return this.pushService.getPublicKey();
  }

  @Post('subscribe')
  @UseGuards(JwtAuthGuard)
  async subscribe(
    @Req() req: RequestWithUser,
    @Body(ValidationPipe) dto: SubscribePushDto,
  ) {
    return this.pushService.subscribe(req.user.userId, req.user.role, dto);
  }

  @Post('unsubscribe')
  @UseGuards(JwtAuthGuard)
  async unsubscribe(@Body(ValidationPipe) dto: UnsubscribePushDto) {
    return this.pushService.unsubscribe(dto.endpoint);
  }
}
