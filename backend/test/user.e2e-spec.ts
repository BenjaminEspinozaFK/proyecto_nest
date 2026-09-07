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

describe('Users (e2e) - permisos de acceso a cuentas ajenas', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  const getHttpServer = (): App => app.getHttpServer();

  const unique = `user-e2e-${Date.now()}`;
  const adminEmail = `${unique}-admin@test.com`;
  const victimEmail = `${unique}-victim@test.com`;
  const attackerEmail = `${unique}-attacker@test.com`;
  const adminPassword = 'Admin123!';
  const victimPassword = 'Victim123!';
  const attackerPassword = 'Attacker123!';

  const rutFor = (seed: string): string => {
    let num = 0;
    for (let i = 0; i < seed.length; i++) {
      num = (num * 31 + seed.charCodeAt(i)) % 90000000;
    }
    const digits = (10000000 + num).toString();
    return `${digits}-${digits[digits.length - 1]}`;
  };

  const mockEmailService = {
    sendVerificationEmail: jest.fn().mockResolvedValue(undefined),
    sendLoginNotification: jest.fn().mockResolvedValue(undefined),
    sendPasswordResetEmail: jest.fn().mockResolvedValue(undefined),
    sendWelcomeEmail: jest.fn().mockResolvedValue(undefined),
    sendPasswordSetupEmail: jest.fn().mockResolvedValue(undefined),
    verifyConnection: jest.fn().mockResolvedValue(true),
  };

  let adminToken: string;
  let attackerToken: string;
  let victimId: string;

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
    const victimHash = await bcrypt.hash(victimPassword, 10);
    const attackerHash = await bcrypt.hash(attackerPassword, 10);

    await prisma.admin.create({
      data: {
        email: adminEmail,
        name: `Admin ${unique}`,
        rut: rutFor(`${unique}-admin`),
        password: adminHash,
        role: 'admin',
      },
    });
    const victim = await prisma.user.create({
      data: {
        email: victimEmail,
        name: `Victima ${unique}`,
        rut: rutFor(`${unique}-victim`),
        password: victimHash,
        role: 'user',
        emailVerified: true,
        lastLogin: new Date(),
      },
    });
    victimId = victim.id;
    await prisma.user.create({
      data: {
        email: attackerEmail,
        name: `Atacante ${unique}`,
        rut: rutFor(`${unique}-attacker`),
        password: attackerHash,
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

    const attackerLogin = await request(getHttpServer())
      .post('/auth/login')
      .send({ email: attackerEmail, password: attackerPassword, role: 'user' })
      .expect(201);
    attackerToken = attackerLogin.body.access_token;
  });

  afterAll(async () => {
    if (prisma) {
      await prisma.session.deleteMany({
        where: {
          OR: [
            { user: { email: { startsWith: 'user-e2e-' } } },
            { admin: { email: { startsWith: 'user-e2e-' } } },
          ],
        },
      });
      await prisma.user.deleteMany({
        where: { email: { startsWith: 'user-e2e-' } },
      });
      await prisma.admin.deleteMany({
        where: { email: { startsWith: 'user-e2e-' } },
      });
    }
    await app?.close();
  });

  it('niega a un usuario listar todos los usuarios', async () => {
    await request(getHttpServer())
      .get('/users')
      .set('Authorization', `Bearer ${attackerToken}`)
      .expect(403);
  });

  it('niega a un usuario ver el perfil de otro usuario por id', async () => {
    await request(getHttpServer())
      .get(`/users/${victimId}`)
      .set('Authorization', `Bearer ${attackerToken}`)
      .expect(403);
  });

  it('niega a un usuario tomar el control de la cuenta de otro (cambiar su password)', async () => {
    await request(getHttpServer())
      .put(`/users/${victimId}`)
      .set('Authorization', `Bearer ${attackerToken}`)
      .send({ name: 'Cuenta secuestrada' })
      .expect(403);

    // La víctima sigue pudiendo loguearse con su password original
    await request(getHttpServer())
      .post('/auth/login')
      .send({ email: victimEmail, password: victimPassword, role: 'user' })
      .expect(201);
  });

  it('niega a un usuario borrar la cuenta de otro usuario', async () => {
    await request(getHttpServer())
      .delete(`/users/${victimId}`)
      .set('Authorization', `Bearer ${attackerToken}`)
      .expect(403);
  });

  it('niega a un usuario crear usuarios directamente', async () => {
    await request(getHttpServer())
      .post('/users')
      .set('Authorization', `Bearer ${attackerToken}`)
      .send({
        email: `${unique}-nuevo@test.com`,
        password: 'Nuevo123!',
        name: 'Nuevo',
        rut: rutFor(`${unique}-nuevo`),
      })
      .expect(403);
  });

  it('permite a un admin listar y ver usuarios por id', async () => {
    const list = await request(getHttpServer())
      .get('/users')
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200);
    expect(Array.isArray(list.body.data ?? list.body)).toBe(true);

    await request(getHttpServer())
      .get(`/users/${victimId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200);
  });

  it('rechaza enviar password por /users/me (debe usarse change-password)', async () => {
    await request(getHttpServer())
      .put('/users/me')
      .set('Authorization', `Bearer ${attackerToken}`)
      .send({ name: 'Nombre válido', password: 'OtraCosa123' })
      .expect(400);
  });

  it('permite actualizar el propio perfil sin password', async () => {
    const res = await request(getHttpServer())
      .put('/users/me')
      .set('Authorization', `Bearer ${attackerToken}`)
      .send({ name: 'Nombre actualizado' })
      .expect(200);

    expect(res.body.name).toBe('Nombre actualizado');
  });
});
