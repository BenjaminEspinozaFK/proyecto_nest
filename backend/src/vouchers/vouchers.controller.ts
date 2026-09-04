import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  Req,
  Patch,
  Query,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { voucherReceiptMulterConfig } from '../common/multer-voucher-receipt.config';
import { PaginationDto } from '../common/dto/pagination.dto';
import { VouchersService } from './vouchers.service';
import { RequestWithUser } from '../auth/interfaces/request-with-user.interface';
import { CreateVoucherDto } from './dto/create-voucher.dto';
import { ApproveVoucherDto } from './dto/approve-voucher.dto';
import { RejectVoucherDto } from './dto/reject-voucher.dto';
import { CreateManualVoucherDto } from './dto/create-manual-voucher.dto';
import { BulkApproveVoucherDto } from './dto/bulk-approve-voucher.dto';
import { BulkRejectVoucherDto } from './dto/bulk-reject-voucher.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('vouchers')
@UseGuards(JwtAuthGuard)
export class VouchersController {
  constructor(private readonly vouchersService: VouchersService) {}

  // Funcionario: Solicitar vale (con comprobante/foto opcional)
  @Post('request')
  @UseInterceptors(FileInterceptor('receipt', voucherReceiptMulterConfig))
  async requestVoucher(
    @Req() req: RequestWithUser,
    @Body() createVoucherDto: CreateVoucherDto,
    @UploadedFile() receipt?: Express.Multer.File,
  ) {
    const userId = req.user.userId;
    const receiptUrl = receipt
      ? `/uploads/vouchers/${receipt.filename}`
      : undefined;
    return this.vouchersService.requestVoucher(
      userId,
      createVoucherDto,
      receiptUrl,
    );
  }

  // Funcionario: Ver mis vales
  @Get('my-vouchers')
  async getMyVouchers(@Req() req: RequestWithUser) {
    const userId = req.user.userId;
    return this.vouchersService.getUserVouchers(userId);
  }

  // Funcionario: Ver mis estadísticas
  @Get('my-stats')
  async getMyStats(@Req() req: RequestWithUser) {
    const userId = req.user.userId;
    return this.vouchersService.getUserVoucherStats(userId);
  }

  // Admin: Ver vales pendientes
  @Get('pending')
  @UseGuards(RolesGuard)
  @Roles('admin')
  async getPendingVouchers() {
    return this.vouchersService.getPendingVouchers();
  }

  // Admin: Ver todos los vales
  @Get('all')
  @UseGuards(RolesGuard)
  @Roles('admin')
  async getAllVouchers(@Query() query: PaginationDto) {
    return this.vouchersService.getAllVouchers(
      query.page ?? 1,
      query.limit ?? 20,
    );
  }

  // Admin: Ver vales de un usuario específico
  @Get('user/:userId')
  @UseGuards(RolesGuard)
  @Roles('admin')
  async getUserVouchers(@Param('userId') userId: string) {
    return this.vouchersService.getUserVouchers(userId);
  }

  // Admin: Ver estadísticas de un usuario
  @Get('user/:userId/stats')
  @UseGuards(RolesGuard)
  @Roles('admin')
  async getUserStats(@Param('userId') userId: string) {
    return this.vouchersService.getUserVoucherStats(userId);
  }

  // Admin: Aprobar vales en lote
  // IMPORTANTE: debe declararse antes de ':id/approve' para que la ruta
  // no sea interceptada tratando "bulk" como el parámetro :id
  @Patch('bulk/approve')
  @UseGuards(RolesGuard)
  @Roles('admin')
  async bulkApproveVouchers(
    @Body() dto: BulkApproveVoucherDto,
    @Req() req: RequestWithUser,
  ) {
    return this.vouchersService.bulkApproveVouchers(
      dto.voucherIds,
      dto.amount,
      req.user.userId,
      dto.notes,
      req.user.name,
    );
  }

  // Admin: Rechazar vales en lote
  @Patch('bulk/reject')
  @UseGuards(RolesGuard)
  @Roles('admin')
  async bulkRejectVouchers(
    @Body() dto: BulkRejectVoucherDto,
    @Req() req: RequestWithUser,
  ) {
    return this.vouchersService.bulkRejectVouchers(
      dto.voucherIds,
      req.user.userId,
      dto.notes,
      req.user.name,
    );
  }

  // Admin: Aprobar vale
  @Patch(':id/approve')
  @UseGuards(RolesGuard)
  @Roles('admin')
  async approveVoucher(
    @Param('id') id: string,
    @Body() approveVoucherDto: ApproveVoucherDto,
    @Req() req: RequestWithUser,
  ) {
    const adminId = req.user.userId;
    return this.vouchersService.approveVoucher(
      id,
      approveVoucherDto,
      adminId,
      req.user.name,
    );
  }

  // Admin: Rechazar vale
  @Patch(':id/reject')
  @UseGuards(RolesGuard)
  @Roles('admin')
  async rejectVoucher(
    @Param('id') id: string,
    @Body() rejectVoucherDto: RejectVoucherDto,
    @Req() req: RequestWithUser,
  ) {
    const adminId = req.user.userId;
    return this.vouchersService.rejectVoucher(
      id,
      rejectVoucherDto,
      adminId,
      req.user.name,
    );
  }

  // Admin: Marcar como entregado
  @Patch(':id/deliver')
  @UseGuards(RolesGuard)
  @Roles('admin')
  async markAsDelivered(@Param('id') id: string, @Req() req: RequestWithUser) {
    return this.vouchersService.markAsDelivered(
      id,
      req.user.userId,
      req.user.name,
    );
  }

  // Admin: Crear vale manual
  @Post('manual')
  @UseGuards(RolesGuard)
  @Roles('admin')
  async createManualVoucher(
    @Body()
    body: CreateManualVoucherDto,
    @Req() req: RequestWithUser,
  ) {
    const adminId = req.user.userId;
    return this.vouchersService.createManualVoucher(
      body.userId,
      body.kilos,
      body.amount,
      adminId,
      body.notes,
      req.user.name,
    );
  }

  // Admin: Estadísticas generales
  @Get('stats/general')
  @UseGuards(RolesGuard)
  @Roles('admin')
  getGeneralStats() {
    return this.vouchersService.getGeneralStats();
  }

  // Admin: Disparar manualmente la expiración de vales aprobados no
  // retirados (normalmente corre solo, una vez al día)
  @Post('expire-check')
  @UseGuards(RolesGuard)
  @Roles('admin')
  runExpirationCheck() {
    return this.vouchersService.expireOldApprovedVouchers();
  }
}
