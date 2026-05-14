import { Module } from '@nestjs/common';
import { VouchersService } from './vouchers.service';
import { VouchersController } from './vouchers.controller';
import { VouchersGateway } from './vouchers.gateway';
import { PrismaService } from '../prisma.service';

@Module({
  controllers: [VouchersController],
  providers: [VouchersService, VouchersGateway],
  exports: [VouchersService],
})
export class VouchersModule {}
