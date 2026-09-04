import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import request from 'supertest';
import type { App } from 'supertest/types';
import * as bcrypt from 'bcryptjs';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma.service';
import { EmailService } from '../src/email/email.service';

jest.mock('otplib', () => ({
  generateSecret: jest.fn(() => 'TEST_SECRET'),
  generateURI: jest.fn(() => 'otpauth://totp/test'),
  verifySync: jest.fn(() => ({ valid: true })),
}));

describe('Vouchers (e2e) - flujo de negocio de vales', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  const getHttpServer = (): App => app.getHttpServer();

  const unique = `voucher-e2e-${Date.now()}`;
  const adminEmail = `${unique}-admin@test.com`;
  const userEmail = `${unique}-user@test.com`;
  const adminPassword = 'Admin123!';
  const userPassword = 'User123!';

  // Rut único por suite para evitar colisiones en la BD de tests compartida
  const rutFor = (seed: string): string => {
    let num = 0;
    for (let i = 0; i < seed.length; i++) {
      num = (num * 31 + seed.charCodeAt(i)) % 90000000;
    }
    const digits = (10000000 + num).toString();
    return `${digits}-${digits[digits.length - 1]}`;
  };
  const adminRut = rutFor(`${unique}-admin`);
  const userRut = rutFor(`${unique}-user`);

  const mockEmailService = {
    sendVerificationEmail: jest.fn().mockResolvedValue(undefined),
    sendLoginNotification: jest.fn().mockResolvedValue(undefined),
    sendPasswordResetEmail: jest.fn().mockResolvedValue(undefined),
    sendWelcomeEmail: jest.fn().mockResolvedValue(undefined),
    sendPasswordSetupEmail: jest.fn().mockResolvedValue(undefined),
    verifyConnection: jest.fn().mockResolvedValue(true),
  };

  const mockCacheManager = {
    get: jest.fn().mockResolvedValue(null),
    set: jest.fn().mockResolvedValue(undefined),
    del: jest.fn().mockResolvedValue(true),
  };

  let adminToken: string;
  let userToken: string;
  let adminId: string;
  let userId: string;
  let voucherId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(EmailService)
      .useValue(mockEmailService)
      .overrideProvider(CACHE_MANAGER)
      .useValue(mockCacheManager)
      .compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    await app.init();
    prisma = app.get(PrismaService);

    const adminHash = await bcrypt.hash(adminPassword, 10);
    const userHash = await bcrypt.hash(userPassword, 10);

    const admin = await prisma.admin.create({
      data: {
        email: adminEmail,
        name: 'Admin Vales E2E',
        rut: adminRut,
        password: adminHash,
        role: 'admin',
      },
    });
    const user = await prisma.user.create({
      data: {
        email: userEmail,
        name: 'User Vales E2E',
        rut: userRut,
        password: userHash,
        role: 'user',
        emailVerified: true,
        lastLogin: new Date(),
      },
    });
    adminId = admin.id;
    userId = user.id;

    const adminLogin = await request(getHttpServer())
      .post('/auth/login')
      .send({ email: adminEmail, password: adminPassword, role: 'admin' })
      .expect(201);
    adminToken = adminLogin.body.access_token;

    const userLogin = await request(getHttpServer())
      .post('/auth/login')
      .send({ email: userEmail, password: userPassword, role: 'user' })
      .expect(201);
    userToken = userLogin.body.access_token;
  });

  afterAll(async () => {
    if (prisma) {
      await prisma.gasVoucher.deleteMany({
        where: {
          user: { email: { startsWith: 'voucher-e2e-' } },
        },
      });
      await prisma.auditLog.deleteMany({
        where: { adminId },
      });
      await prisma.notification.deleteMany({
        where: {
          OR: [{ userId }, { adminId }],
        },
      });
      await prisma.monthlyPayment.deleteMany({ where: { userId } });
      await prisma.session.deleteMany({
        where: {
          OR: [
            { user: { email: { startsWith: 'voucher-e2e-' } } },
            { admin: { email: { startsWith: 'voucher-e2e-' } } },
          ],
        },
      });
      await prisma.pushSubscription.deleteMany({
        where: {
          OR: [{ userId }, { adminId }],
        },
      });
      await prisma.user.deleteMany({
        where: { email: { startsWith: 'voucher-e2e-' } },
      });
      await prisma.admin.deleteMany({
        where: { email: { startsWith: 'voucher-e2e-' } },
      });
    }
    await app?.close();
  });

  it('permite al usuario solicitar un vale', async () => {
    const res = await request(getHttpServer())
      .post('/vouchers/request')
      .set('Authorization', `Bearer ${userToken}`)
      .send({ kilos: 15, bank: 'BancoEstado' })
      .expect(201);

    expect(res.body.userId).toBe(userId);
    expect(res.body.kilos).toBe(15);
    expect(res.body.status).toBe('pending');

    voucherId = res.body.id;
  });

  it('rechaza la solicitud de vale con kilos no permitidos', async () => {
    await request(getHttpServer())
      .post('/vouchers/request')
      .set('Authorization', `Bearer ${userToken}`)
      .send({ kilos: 16 })
      .expect(400);
  });

  it('rechaza la solicitud de vale sin autenticación', async () => {
    await request(getHttpServer())
      .post('/vouchers/request')
      .send({ kilos: 5 })
      .expect(401);
  });

  it('permite al usuario ver sus propios vales', async () => {
    const res = await request(getHttpServer())
      .get('/vouchers/my-vouchers')
      .set('Authorization', `Bearer ${userToken}`)
      .expect(200);

    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.some((v: any) => v.id === voucherId)).toBe(true);
  });

  it('devuelve las estadísticas del usuario', async () => {
    const res = await request(getHttpServer())
      .get('/vouchers/my-stats')
      .set('Authorization', `Bearer ${userToken}`)
      .expect(200);

    expect(res.body.total).toBeGreaterThanOrEqual(1);
    expect(res.body.pending).toBeGreaterThanOrEqual(1);
  });

  it('permite al admin ver los vales pendientes', async () => {
    const res = await request(getHttpServer())
      .get('/vouchers/pending')
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200);

    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.some((v: any) => v.id === voucherId)).toBe(true);
  });

  it('niega a un usuario el acceso a vales pendientes (admin)', async () => {
    await request(getHttpServer())
      .get('/vouchers/pending')
      .set('Authorization', `Bearer ${userToken}`)
      .expect(403);
  });

  it('permite al admin aprobar el vale', async () => {
    const res = await request(getHttpServer())
      .patch(`/vouchers/${voucherId}/approve`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ amount: 14000, notes: 'Aprobado' })
      .expect(200);

    expect(res.body.id).toBe(voucherId);
    expect(res.body.status).toBe('approved');
    expect(res.body.amount).toBe(14000);
  });

  it('refleja el estado aprobado en los vales del usuario', async () => {
    const res = await request(getHttpServer())
      .get('/vouchers/my-vouchers')
      .set('Authorization', `Bearer ${userToken}`)
      .expect(200);

    const voucher = res.body.find((v: any) => v.id === voucherId);
    expect(voucher.status).toBe('approved');
  });

  it('permite al admin marcar el vale como entregado', async () => {
    const res = await request(getHttpServer())
      .patch(`/vouchers/${voucherId}/deliver`)
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200);

    expect(res.body.status).toBe('delivered');
  });

  it('permite al admin crear un vale manual', async () => {
    const res = await request(getHttpServer())
      .post('/vouchers/manual')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ userId, kilos: 45, amount: 30000, notes: 'Vale directo' })
      .expect(201);

    expect(res.body.userId).toBe(userId);
    expect(res.body.status).toBe('approved');
    expect(res.body.kilos).toBe(45);
  });

  it('permite al admin crear y aprobar vales en lote', async () => {
    const first = await request(getHttpServer())
      .post('/vouchers/request')
      .set('Authorization', `Bearer ${userToken}`)
      .send({ kilos: 5 })
      .expect(201);
    const second = await request(getHttpServer())
      .post('/vouchers/request')
      .set('Authorization', `Bearer ${userToken}`)
      .send({ kilos: 11 })
      .expect(201);

    const res = await request(getHttpServer())
      .patch('/vouchers/bulk/approve')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ voucherIds: [first.body.id, second.body.id], amount: 10000 })
      .expect(200);

    expect(res.body.succeeded).toHaveLength(2);
    expect(res.body.failed).toHaveLength(0);
  });

  it('permite al admin rechazar un vale', async () => {
    const pendingVoucher = await request(getHttpServer())
      .post('/vouchers/request')
      .set('Authorization', `Bearer ${userToken}`)
      .send({ kilos: 11 })
      .expect(201);

    const res = await request(getHttpServer())
      .patch(`/vouchers/${pendingVoucher.body.id}/reject`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ notes: 'Sin documentación' })
      .expect(200);

    expect(res.body.status).toBe('rejected');
    expect(res.body.notes).toBe('Sin documentación');
  });

  it('permite al admin listar todos los vales paginados', async () => {
    const res = await request(getHttpServer())
      .get('/vouchers/all')
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200);

    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.meta).toBeDefined();
  });

  it('permite al admin consultar las estadísticas generales', async () => {
    const res = await request(getHttpServer())
      .get('/vouchers/stats/general')
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200);

    expect(res.body.total).toBeGreaterThanOrEqual(1);
    expect(typeof res.body.totalAmount).toBe('number');
  });

  it('niega al usuario las rutas de administrador de vales', async () => {
    await request(getHttpServer())
      .patch(`/vouchers/${voucherId}/approve`)
      .set('Authorization', `Bearer ${userToken}`)
      .send({ amount: 10000 })
      .expect(403);
  });

  describe('expiración automática de vales aprobados no retirados', () => {
    let oldVoucherId: string;
    let recentVoucherId: string;

    beforeAll(async () => {
      // Se insertan directo por Prisma (no vía POST /vouchers/request) para
      // no disparar notifyAllAdmins de nuevo — con varios e2e corriendo en
      // paralelo sobre la misma BD, eso puede chocar con el afterAll de
      // otra suite que borra sus propios admins de prueba.
      const fortyDaysAgo = new Date();
      fortyDaysAgo.setDate(fortyDaysAgo.getDate() - 40);

      const oldVoucher = await prisma.gasVoucher.create({
        data: {
          userId,
          kilos: 5,
          amount: 5000,
          status: 'approved',
          approvalDate: fortyDaysAgo,
          approvedBy: adminId,
        },
      });
      oldVoucherId = oldVoucher.id;

      const recentVoucher = await prisma.gasVoucher.create({
        data: {
          userId,
          kilos: 5,
          amount: 5000,
          status: 'approved',
          approvalDate: new Date(),
          approvedBy: adminId,
        },
      });
      recentVoucherId = recentVoucher.id;
    });

    it('niega el chequeo manual de expiración a un usuario', async () => {
      await request(getHttpServer())
        .post('/vouchers/expire-check')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(403);
    });

    it('expira solo el vale aprobado hace más de 30 días', async () => {
      const res = await request(getHttpServer())
        .post('/vouchers/expire-check')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(201);

      expect(res.body.expired).toBeGreaterThanOrEqual(1);

      const vouchers = await request(getHttpServer())
        .get('/vouchers/my-vouchers')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      const oldVoucher = vouchers.body.find((v: any) => v.id === oldVoucherId);
      const recentVoucher = vouchers.body.find(
        (v: any) => v.id === recentVoucherId,
      );

      expect(oldVoucher.status).toBe('expired');
      expect(recentVoucher.status).toBe('approved');
    });
  });
});
