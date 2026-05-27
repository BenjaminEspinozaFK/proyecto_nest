import { Module } from '@nestjs/common';
import { VouchersService } from './vouchers.service';
import { VouchersController } from './vouchers.controller';
import { VouchersGateway } from './vouchers.gateway';
import { VOUCHERS_REPOSITORY } from './vouchers.tokens';
import { PrismaVouchersRepository } from './infrastructure/prisma-vouchers.repository';

@Module({
  controllers: [VouchersController],
  providers: [
    VouchersService,
    VouchersGateway,
    { provide: VOUCHERS_REPOSITORY, useClass: PrismaVouchersRepository },
  ],
  exports: [VouchersService],
})
export class VouchersModule {}
