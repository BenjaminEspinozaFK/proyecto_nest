import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
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

describe('MonthlyPayments (e2e) - flujo de negocio de pagos mensuales', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  const getHttpServer = (): App => app.getHttpServer() as unknown as App;

  const unique = `pay-e2e-${Date.now()}`;
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

  let adminToken: string;
  let userToken: string;
  let adminId: string;
  let userId: string;
  let paymentId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(EmailService)
      .useValue(mockEmailService)
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
        name: 'Admin Pagos E2E',
        rut: adminRut,
        password: adminHash,
        role: 'admin',
      },
    });
    const user = await prisma.user.create({
      data: {
        email: userEmail,
        name: 'User Pagos E2E',
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
      await prisma.monthlyPayment.deleteMany({ where: { userId } });
      await prisma.auditLog.deleteMany({ where: { adminId } });
      await prisma.notification.deleteMany({
        where: {
          OR: [{ userId }, { adminId }],
        },
      });
      await prisma.session.deleteMany({
        where: {
          OR: [
            { user: { email: { startsWith: 'pay-e2e-' } } },
            { admin: { email: { startsWith: 'pay-e2e-' } } },
          ],
        },
      });
      await prisma.user.deleteMany({
        where: { email: { startsWith: 'pay-e2e-' } },
      });
      await prisma.admin.deleteMany({
        where: { email: { startsWith: 'pay-e2e-' } },
      });
    }
    await app?.close();
  });

  it('permite al admin registrar un pago mensual', async () => {
    const res = await request(getHttpServer())
      .post('/monthly-payments')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        userId,
        year: 2026,
        month: 8,
        amount: 25000,
        description: 'Cuota de agosto',
      })
      .expect(201);

    expect(res.body.userId).toBe(userId);
    expect(res.body.amount).toBe(25000);
    expect(res.body.month).toBe(8);

    paymentId = res.body.id;
  });

  it('rechaza un pago mensual con una fecha inválida', async () => {
    await request(getHttpServer())
      .post('/monthly-payments')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ userId, year: 1999, month: 13, amount: 25000 })
      .expect(400);
  });

  it('permite al admin registrar un segundo pago', async () => {
    const res = await request(getHttpServer())
      .post('/monthly-payments')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ userId, year: 2026, month: 9, amount: 25000 })
      .expect(201);

    expect(res.body.month).toBe(9);
  });

  it('niega a un usuario crear pagos (solo admin)', async () => {
    await request(getHttpServer())
      .post('/monthly-payments')
      .set('Authorization', `Bearer ${userToken}`)
      .send({ userId, year: 2026, month: 10, amount: 25000 })
      .expect(403);
  });

  it('permite al usuario ver sus propios pagos', async () => {
    const res = await request(getHttpServer())
      .get('/monthly-payments/my-payments')
      .set('Authorization', `Bearer ${userToken}`)
      .expect(200);

    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBe(2);
    expect(res.body.some((p: any) => p.id === paymentId)).toBe(true);
  });

  it('permite al usuario ver el resumen de sus pagos', async () => {
    const res = await request(getHttpServer())
      .get('/monthly-payments/my-payments/summary')
      .set('Authorization', `Bearer ${userToken}`)
      .expect(200);

    expect(Array.isArray(res.body)).toBe(true);
    const summary2026 = res.body.find((s: any) => s.year === 2026);
    expect(summary2026.total).toBe(50000);
    expect(summary2026.months).toHaveLength(2);
  });

  it('permite al usuario ver sus pagos por año', async () => {
    const res = await request(getHttpServer())
      .get('/monthly-payments/my-payments/year/2026')
      .set('Authorization', `Bearer ${userToken}`)
      .expect(200);

    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBe(2);
  });

  it('permite al admin listar todos los pagos', async () => {
    const res = await request(getHttpServer())
      .get('/monthly-payments/all')
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200);

    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.some((p: any) => p.id === paymentId)).toBe(true);
  });

  it('permite al admin ver los pagos de un usuario', async () => {
    const res = await request(getHttpServer())
      .get(`/monthly-payments/user/${userId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200);

    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBe(2);
  });

  it('permite al admin ver el resumen de pagos de un usuario', async () => {
    const res = await request(getHttpServer())
      .get(`/monthly-payments/user/${userId}/summary`)
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200);

    const summary2026 = res.body.find((s: any) => s.year === 2026);
    expect(summary2026.months).toHaveLength(2);
  });

  it('permite al admin consultar el total de un mes', async () => {
    const res = await request(getHttpServer())
      .get(`/monthly-payments/user/${userId}/month/2026/8`)
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200);

    expect(res.body.total).toBe(25000);
  });

  it('permite al admin consultar los pagos de un año', async () => {
    const res = await request(getHttpServer())
      .get(`/monthly-payments/user/${userId}/year/2026`)
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200);

    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBe(2);
  });

  it('permite al admin actualizar un pago', async () => {
    const res = await request(getHttpServer())
      .patch(`/monthly-payments/${paymentId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ amount: 30000, description: 'Cuota actualizada' })
      .expect(200);

    expect(res.body.id).toBe(paymentId);
    expect(res.body.amount).toBe(30000);
  });

  it('permite al admin eliminar un pago', async () => {
    const res = await request(getHttpServer())
      .delete(`/monthly-payments/${paymentId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200);

    expect(res.body.id).toBe(paymentId);
  });

  it('refleja la eliminación en los pagos del usuario', async () => {
    const res = await request(getHttpServer())
      .get('/monthly-payments/my-payments')
      .set('Authorization', `Bearer ${userToken}`)
      .expect(200);

    expect(res.body.some((p: any) => p.id === paymentId)).toBe(false);
    expect(res.body.length).toBe(1);
  });
});
