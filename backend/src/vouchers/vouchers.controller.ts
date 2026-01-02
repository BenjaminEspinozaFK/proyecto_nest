import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  Req,
  Patch,
} from '@nestjs/common';
import { VouchersService } from './vouchers.service';
import { CreateVoucherDto } from './dto/create-voucher.dto';
import { ApproveVoucherDto } from './dto/approve-voucher.dto';
import { RejectVoucherDto } from './dto/reject-voucher.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('vouchers')
@UseGuards(JwtAuthGuard)
export class VouchersController {
  constructor(private readonly vouchersService: VouchersService) {}

  // Funcionario: Solicitar vale
  @Post('request')
  async requestVoucher(@Req() req, @Body() createVoucherDto: CreateVoucherDto) {
    const userId = req.user.userId;
    return this.vouchersService.requestVoucher(userId, createVoucherDto);
  }

  // Funcionario: Ver mis vales
  @Get('my-vouchers')
  async getMyVouchers(@Req() req) {
    const userId = req.user.userId;
    return this.vouchersService.getUserVouchers(userId);
  }

  // Funcionario: Ver mis estadísticas
  @Get('my-stats')
  async getMyStats(@Req() req) {
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
  async getAllVouchers() {
    return this.vouchersService.getAllVouchers();
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

  // Admin: Aprobar vale
  @Patch(':id/approve')
  @UseGuards(RolesGuard)
  @Roles('admin')
  async approveVoucher(
    @Param('id') id: string,
    @Body() approveVoucherDto: ApproveVoucherDto,
    @Req() req,
  ) {
    const adminId = req.user.userId;
    return this.vouchersService.approveVoucher(id, approveVoucherDto, adminId);
  }

  // Admin: Rechazar vale
  @Patch(':id/reject')
  @UseGuards(RolesGuard)
  @Roles('admin')
  async rejectVoucher(
    @Param('id') id: string,
    @Body() rejectVoucherDto: RejectVoucherDto,
    @Req() req,
  ) {
    const adminId = req.user.userId;
    return this.vouchersService.rejectVoucher(id, rejectVoucherDto, adminId);
  }

  // Admin: Marcar como entregado
  @Patch(':id/deliver')
  @UseGuards(RolesGuard)
  @Roles('admin')
  async markAsDelivered(@Param('id') id: string) {
    return this.vouchersService.markAsDelivered(id);
  }

  // Admin: Crear vale manual
  @Post('manual')
  @UseGuards(RolesGuard)
  @Roles('admin')
  async createManualVoucher(
    @Body()
    body: {
      userId: string;
      kilos: number;
      amount: number;
      notes?: string;
    },
    @Req() req,
  ) {
    const adminId = req.user.userId;
    return this.vouchersService.createManualVoucher(
      body.userId,
      body.kilos,
      body.amount,
      adminId,
      body.notes,
    );
  }

  // Admin: Estadísticas generales
  @Get('stats/general')
  @UseGuards(RolesGuard)
  @Roles('admin')
  async getGeneralStats() {
    return this.vouchersService.getGeneralStats();
  }
}
