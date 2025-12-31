import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CreateVoucherDto } from './dto/create-voucher.dto';
import { ApproveVoucherDto } from './dto/approve-voucher.dto';
import { RejectVoucherDto } from './dto/reject-voucher.dto';
import { VouchersGateway } from './vouchers.gateway';
import * as ExcelJS from 'exceljs';
import * as path from 'path';
import * as fs from 'fs';

@Injectable()
export class VouchersService {
  constructor(
    private prisma: PrismaService,
    private vouchersGateway: VouchersGateway,
  ) {}

  // Funcionario solicita un vale
  async requestVoucher(userId: string, createVoucherDto: CreateVoucherDto) {
    const voucher = await this.prisma.gasVoucher.create({
      data: {
        userId,
        kilos: createVoucherDto.kilos,
        bank: createVoucherDto.bank,
        status: 'pending',
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    // Emitir evento de nuevo vale creado a los admins
    this.vouchersGateway.notifyVoucherCreated(voucher);

    return voucher;
  }

  // Obtener vales de un usuario específico
  async getUserVouchers(userId: string) {
    return this.prisma.gasVoucher.findMany({
      where: { userId },
      orderBy: { requestDate: 'desc' },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });
  }

  // Admin: Obtener todos los vales pendientes
  async getPendingVouchers() {
    return this.prisma.gasVoucher.findMany({
      where: { status: 'pending' },
      orderBy: { requestDate: 'asc' },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });
  }

  // Admin: Obtener todos los vales
  async getAllVouchers() {
    return this.prisma.gasVoucher.findMany({
      orderBy: { requestDate: 'desc' },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });
  }

  // Admin: Aprobar vale
  async approveVoucher(
    voucherId: string,
    approveVoucherDto: ApproveVoucherDto,
    adminId: string,
  ) {
    const voucher = await this.prisma.gasVoucher.update({
      where: { id: voucherId },
      data: {
        status: 'approved',
        amount: approveVoucherDto.amount,
        approvalDate: new Date(),
        approvedBy: adminId,
        notes: approveVoucherDto.notes,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    // Emitir evento de vale aprobado
    this.vouchersGateway.notifyVoucherApproved(voucher);

    return voucher;
  }

  // Admin: Rechazar vale
  async rejectVoucher(
    voucherId: string,
    rejectVoucherDto: RejectVoucherDto,
    adminId: string,
  ) {
    const voucher = await this.prisma.gasVoucher.update({
      where: { id: voucherId },
      data: {
        status: 'rejected',
        approvedBy: adminId,
        notes: rejectVoucherDto.notes,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    // Emitir evento de vale rechazado
    this.vouchersGateway.notifyVoucherRejected(voucher);

    return voucher;
  }

  // Admin: Marcar como entregado
  async markAsDelivered(voucherId: string) {
    const voucher = await this.prisma.gasVoucher.update({
      where: { id: voucherId },
      data: {
        status: 'delivered',
        deliveredDate: new Date(),
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    // Emitir evento de vale entregado
    this.vouchersGateway.notifyVoucherDelivered(voucher);

    return voucher;
  }

  // Admin: Crear vale manual (asignar directamente)
  async createManualVoucher(
    userId: string,
    kilos: number,
    amount: number,
    adminId: string,
    notes?: string,
  ) {
    return this.prisma.gasVoucher.create({
      data: {
        userId,
        kilos,
        amount,
        status: 'approved',
        approvalDate: new Date(),
        approvedBy: adminId,
        notes,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });
  }

  // Estadísticas de un usuario
  async getUserVoucherStats(userId: string) {
    const vouchers = await this.prisma.gasVoucher.findMany({
      where: { userId },
    });

    const total = vouchers.length;
    const pending = vouchers.filter((v) => v.status === 'pending').length;
    const approved = vouchers.filter((v) => v.status === 'approved').length;
    const delivered = vouchers.filter((v) => v.status === 'delivered').length;
    const rejected = vouchers.filter((v) => v.status === 'rejected').length;
    const totalAmount = vouchers
      .filter((v) => v.amount)
      .reduce((sum, v) => sum + (v.amount || 0), 0);

    return {
      total,
      pending,
      approved,
      delivered,
      rejected,
      totalAmount,
    };
  }

  // Estadísticas generales (para admin)
  async getGeneralStats() {
    const vouchers = await this.prisma.gasVoucher.findMany();

    const total = vouchers.length;
    const pending = vouchers.filter((v) => v.status === 'pending').length;
    const approved = vouchers.filter((v) => v.status === 'approved').length;
    const delivered = vouchers.filter((v) => v.status === 'delivered').length;
    const rejected = vouchers.filter((v) => v.status === 'rejected').length;
    const totalAmount = vouchers
      .filter((v) => v.amount)
      .reduce((sum, v) => sum + (v.amount || 0), 0);

    // Vales de este mes
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const thisMonth = vouchers.filter(
      (v) => v.requestDate >= startOfMonth,
    ).length;

    return {
      total,
      pending,
      approved,
      delivered,
      rejected,
      totalAmount,
      thisMonth,
    };
  }

  // Generar Excel con vales aprobados/entregados
  async generateVouchersExcel() {
    // Obtener todos los vales aprobados o entregados
    const vouchers = await this.prisma.gasVoucher.findMany({
      where: {
        status: {
          in: ['approved', 'delivered'],
        },
      },
      include: {
        user: {
          select: {
            rut: true,
            name: true,
            phone: true,
          },
        },
      },
      orderBy: {
        approvalDate: 'desc',
      },
    });

    // Leer el archivo de plantilla ORIGINAL (sin modificar nada)
    const templatePath = path.join(
      process.cwd(),
      'FORMATO ORIGINAL 24.30 ABRIL 2025.xlsx',
    );

    if (!fs.existsSync(templatePath)) {
      throw new Error('Archivo de plantilla no encontrado');
    }

    // Leer el Excel ORIGINAL completo
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.readFile(templatePath);
    const worksheet = workbook.getWorksheet(1);

    if (!worksheet) {
      throw new Error('No se pudo leer la hoja del Excel');
    }

    // Obtener los precios desde la plantilla (fila 2)
    // Extraer el valor numérico real (no fórmulas)
    const cellD2 = worksheet.getCell('D2');
    const cellE2 = worksheet.getCell('E2');
    const cellF2 = worksheet.getCell('F2');
    const cellG2 = worksheet.getCell('G2');

    const precio5kg = typeof cellD2.value === 'number' ? cellD2.value : 10000;
    const precio11kg = typeof cellE2.value === 'number' ? cellE2.value : 18250;
    const precio15kg = typeof cellF2.value === 'number' ? cellF2.value : 21500;
    const precio45kg = typeof cellG2.value === 'number' ? cellG2.value : 62000;

    // Agrupar vales por usuario
    const userVouchersMap = new Map<
      string,
      {
        rut: string;
        name: string;
        phone: string;
        bank: string;
        balones: { [key: number]: number };
        monto: number; // Monto total del usuario
        fecha: Date;
      }
    >();

    vouchers.forEach((voucher) => {
      const userId = voucher.userId;
      if (!userVouchersMap.has(userId)) {
        userVouchersMap.set(userId, {
          rut: voucher.user.rut,
          name: voucher.user.name || '',
          phone: voucher.user.phone || '',
          bank: voucher.bank || '',
          balones: { 5: 0, 11: 0, 15: 0, 45: 0 },
          monto: 0,
          fecha: voucher.approvalDate || voucher.requestDate,
        });
      }

      const userData = userVouchersMap.get(userId)!;
      userData.balones[voucher.kilos] =
        (userData.balones[voucher.kilos] || 0) + 1;

      // Sumar el monto del voucher al total del usuario
      userData.monto += voucher.amount || 0;

      const currentDate = voucher.approvalDate || voucher.requestDate;
      if (currentDate > userData.fecha) {
        userData.fecha = currentDate;
      }
    });

    // SOLO AGREGAR filas con datos (empezando desde FILA 7, COLUMNA B)
    let rowNumber = 7;

    userVouchersMap.forEach((userData) => {
      const cant5 = userData.balones[5] || 0;
      const cant11 = userData.balones[11] || 0;
      const cant15 = userData.balones[15] || 0;
      const cant45 = userData.balones[45] || 0;

      // Usar el MONTO que ya tiene guardado el usuario (no calcular)
      const valorFinal = userData.monto || 0;

      // Llenar las celdas EXACTAS empezando desde COLUMNA B FILA 7
      worksheet.getCell(`B${rowNumber}`).value = valorFinal; // VALOR (monto del usuario)
      worksheet.getCell(`C${rowNumber}`).value = userData.rut; // RUT
      worksheet.getCell(`D${rowNumber}`).value = userData.name; // NOMBRE
      worksheet.getCell(`E${rowNumber}`).value = cant5; // 5 kg
      worksheet.getCell(`F${rowNumber}`).value = cant11; // 11 kg
      worksheet.getCell(`G${rowNumber}`).value = cant15; // 15 kg
      worksheet.getCell(`H${rowNumber}`).value = cant45; // 45 kg
      worksheet.getCell(`I${rowNumber}`).value = userData.phone; // FONO
      worksheet.getCell(`J${rowNumber}`).value = ''; // N° TRANSFERENCIA
      worksheet.getCell(`K${rowNumber}`).value = userData.fecha; // FECHA
      worksheet.getCell(`L${rowNumber}`).value = userData.bank; // BANCO

      rowNumber++;
    });

    // Devolver el archivo tal cual (sin modificar formato)
    const buffer = await workbook.xlsx.writeBuffer();
    return buffer;
  }
}
