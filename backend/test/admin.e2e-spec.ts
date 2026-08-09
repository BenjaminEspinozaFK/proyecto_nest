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

describe('Admin (e2e) - CRUD de usuarios y permisos por rol', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  const getHttpServer = (): App => app.getHttpServer() as unknown as App;

  const unique = `admin-e2e-${Date.now()}`;
  const adminEmail = `${unique}-admin@test.com`;
  const userEmail = `${unique}-user@test.com`;
  const createdEmail = `${unique}-created@test.com`;
  const adminPassword = 'Admin123!';
  const userPassword = 'User123!';

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
  let createdUserId: string;

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

    // Seed directo en BD: admin y usuario verificado
    const adminHash = await bcrypt.hash(adminPassword, 10);
    const userHash = await bcrypt.hash(userPassword, 10);

    await prisma.admin.create({
      data: {
        email: adminEmail,
        name: 'Admin E2E',
        rut: '22222222-2',
        password: adminHash,
        role: 'admin',
      },
    });
    await prisma.user.create({
      data: {
        email: userEmail,
        name: 'User E2E',
        rut: '33333333-3',
        password: userHash,
        role: 'user',
        emailVerified: true,
        lastLogin: new Date(),
      },
    });

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
      const admins = await prisma.admin.findMany({
        where: { email: { startsWith: 'admin-e2e-' } },
      });
      await prisma.auditLog.deleteMany({
        where: { adminId: { in: admins.map((a) => a.id) } },
      });
      await prisma.session.deleteMany({
        where: {
          OR: [
            { user: { email: { startsWith: 'admin-e2e-' } } },
            { admin: { email: { startsWith: 'admin-e2e-' } } },
          ],
        },
      });
      await prisma.user.deleteMany({
        where: { email: { startsWith: 'admin-e2e-' } },
      });
      await prisma.admin.deleteMany({
        where: { email: { startsWith: 'admin-e2e-' } },
      });
    }
    await app?.close();
  });

  it('permite al admin listar todos los usuarios', async () => {
    const res = await request(getHttpServer())
      .get('/admins/users')
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200);

    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.meta).toBeDefined();
    expect(res.body.data.length).toBeGreaterThanOrEqual(1);
  });

  it('permite al admin crear un usuario', async () => {
    const res = await request(getHttpServer())
      .post('/admins/users')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        email: createdEmail,
        name: 'Usuario Creado',
        rut: '44444444-4',
        password: 'Temp1234',
        phone: '12345678',
      })
      .expect(201);

    createdUserId = res.body.id;
    expect(res.body.email).toBe(createdEmail);
    expect(res.body.name).toBe('Usuario Creado');
  });

  it('rechaza crear un usuario con email duplicado', async () => {
    await request(getHttpServer())
      .post('/admins/users')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        email: createdEmail,
        name: 'Duplicado',
        rut: '55555555-5',
        password: 'Temp1234',
      })
      .expect(409);
  });

  it('permite al admin actualizar un usuario', async () => {
    const res = await request(getHttpServer())
      .put(`/admins/users/${createdUserId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ name: 'Usuario Actualizado' })
      .expect(200);

    expect(res.body.name).toBe('Usuario Actualizado');
  });

  it('permite al admin eliminar un usuario', async () => {
    const res = await request(getHttpServer())
      .delete(`/admins/users/${createdUserId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200);

    expect(res.body.message).toContain('eliminado');
  });

  it('niega a un usuario el acceso a rutas de administrador', async () => {
    await request(getHttpServer())
      .get('/admins/users')
      .set('Authorization', `Bearer ${userToken}`)
      .expect(403);
  });

  it('permite al usuario ver su propio perfil', async () => {
    const res = await request(getHttpServer())
      .get('/users/me')
      .set('Authorization', `Bearer ${userToken}`)
      .expect(200);

    expect(res.body.email).toBe(userEmail);
  });

  it('niega a un usuario el acceso sin token válido', async () => {
    await request(getHttpServer())
      .get('/users/me')
      .set('Authorization', 'Bearer token-invalido')
      .expect(401);
  });
});
