import { Module } from '@nestjs/common';
import { PushService } from './push.service';
import { PushController } from './push.controller';
import { PUSH_REPOSITORY } from './push.tokens';
import { PrismaPushRepository } from './infrastructure/prisma-push.repository';

@Module({
  controllers: [PushController],
  providers: [
    PushService,
    { provide: PUSH_REPOSITORY, useClass: PrismaPushRepository },
  ],
  exports: [PushService],
})
export class PushModule {}
