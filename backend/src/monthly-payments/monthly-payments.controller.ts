import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Patch,
  UseGuards,
  Req,
} from '@nestjs/common';
import { MonthlyPaymentsService } from './monthly-payments.service';
import { CreateMonthlyPaymentDto } from './dto/create-monthly-payment.dto';
import { UpdateMonthlyPaymentDto } from './dto/update-monthly-payment.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('monthly-payments')
@UseGuards(JwtAuthGuard, RolesGuard)
export class MonthlyPaymentsController {
  constructor(
    private readonly monthlyPaymentsService: MonthlyPaymentsService,
  ) {}

  // Admin: Crear un pago mensual para un usuario
  @Post()
  @Roles('admin')
  async createPayment(
    @Body() createDto: CreateMonthlyPaymentDto,
    @Req() req: any,
  ) {
    const adminId = req.user?.id || req.user?.userId;
    return this.monthlyPaymentsService.createPayment(createDto, adminId);
  }

  // Admin: Obtener todos los pagos de un usuario
  @Get('user/:userId')
  @Roles('admin')
  async getUserPayments(@Param('userId') userId: string) {
    return this.monthlyPaymentsService.getUserPayments(userId);
  }

  // Admin: Obtener resumen de pagos de un usuario
  @Get('user/:userId/summary')
  @Roles('admin')
  async getPaymentSummary(@Param('userId') userId: string) {
    return this.monthlyPaymentsService.getPaymentSummary(userId);
  }

  // Admin: Obtener pagos de un año específico
  @Get('user/:userId/year/:year')
  @Roles('admin')
  async getUserPaymentsByYear(
    @Param('userId') userId: string,
    @Param('year') year: string,
  ) {
    return this.monthlyPaymentsService.getUserPaymentsByYear(
      userId,
      parseInt(year),
    );
  }

  // Admin: Obtener total de un mes
  @Get('user/:userId/month/:year/:month')
  @Roles('admin')
  async getMonthTotal(
    @Param('userId') userId: string,
    @Param('year') year: string,
    @Param('month') month: string,
  ) {
    const total = await this.monthlyPaymentsService.getMonthTotal(
      userId,
      parseInt(year),
      parseInt(month),
    );
    return { total };
  }

  // Admin: Actualizar un pago
  @Patch(':id')
  @Roles('admin')
  async updatePayment(
    @Param('id') id: string,
    @Body() updateDto: UpdateMonthlyPaymentDto,
  ) {
    return this.monthlyPaymentsService.updatePayment(id, updateDto);
  }

  // Admin: Eliminar un pago
  @Delete(':id')
  @Roles('admin')
  async deletePayment(@Param('id') id: string) {
    return this.monthlyPaymentsService.deletePayment(id);
  }
}
