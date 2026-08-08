import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import type { App } from 'supertest/types';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma.service';
import { EmailService } from '../src/email/email.service';

jest.mock('otplib', () => ({
  generateSecret: jest.fn(() => 'TEST_SECRET'),
  generateURI: jest.fn(() => 'otpauth://totp/test'),
  verifySync: jest.fn(() => ({ valid: true })),
}));

describe('Auth (e2e) - flujos críticos', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  const getHttpServer = (): App => app.getHttpServer() as unknown as App;

  const unique = `auth-e2e-${Date.now()}`;
  const email = `${unique}@test.com`;
  const password = 'Password123';
  const rut = '12345678-9';

  const mockEmailService = {
    sendVerificationEmail: jest.fn().mockResolvedValue(undefined),
    sendLoginNotification: jest.fn().mockResolvedValue(undefined),
    sendPasswordResetEmail: jest.fn().mockResolvedValue(undefined),
    sendWelcomeEmail: jest.fn().mockResolvedValue(undefined),
    sendPasswordSetupEmail: jest.fn().mockResolvedValue(undefined),
    verifyConnection: jest.fn().mockResolvedValue(true),
  };

  let accessToken: string;
  let refreshToken: string;
  let rotatedToken: string;

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
  });

  afterAll(async () => {
    await prisma.session.deleteMany({
      where: { user: { email: { startsWith: 'auth-e2e-' } } },
    });
    await prisma.user.deleteMany({
      where: { email: { startsWith: 'auth-e2e-' } },
    });
    await app.close();
  });

  it('registra un usuario nuevo', async () => {
    const res = await request(getHttpServer())
      .post('/auth/register')
      .send({ email, password, name: 'Usuario E2E', rut, phone: '98765432' })
      .expect(201);

    expect(res.body.message).toContain('Registro exitoso');
  });

  it('rechaza el registro con un email duplicado', async () => {
    await request(getHttpServer())
      .post('/auth/register')
      .send({ email, password, name: 'Otro Usuario', rut })
      .expect(409);
  });

  it('no permite iniciar sesión si el email no está verificado', async () => {
    const res = await request(getHttpServer())
      .post('/auth/login')
      .send({ email, password, role: 'user' })
      .expect(401);

    expect(res.body.message).toContain('verificar');
  });

  it('verifica el email usando el token guardado en la BD', async () => {
    const user = await prisma.user.findUnique({ where: { email } });
    const token = user?.emailVerificationToken;

    expect(token).toBeTruthy();

    const res = await request(getHttpServer())
      .get('/auth/verify-email')
      .query({ token })
      .expect(200);

    expect(res.body.message).toContain('verificado');
  });

  it('inicia sesión y devuelve access_token y refresh_token', async () => {
    const res = await request(getHttpServer())
      .post('/auth/login')
      .send({ email, password, role: 'user' })
      .expect(201);

    expect(res.body.access_token).toBeDefined();
    expect(res.body.refresh_token).toBeDefined();
    expect(res.body.user.email).toBe(email);
    expect(res.body.user.role).toBe('user');

    accessToken = res.body.access_token;
    refreshToken = res.body.refresh_token;
  });

  it('rechaza el login con contraseña incorrecta', async () => {
    await request(getHttpServer())
      .post('/auth/login')
      .send({ email, password: 'wrong-password', role: 'user' })
      .expect(401);
  });

  it('GET /auth/me devuelve el perfil del usuario autenticado', async () => {
    const res = await request(getHttpServer())
      .get('/auth/me')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);

    expect(res.body.email).toBe(email);
  });

  it('GET /auth/me sin token devuelve 401', async () => {
    await request(getHttpServer()).get('/auth/me').expect(401);
  });

  it('renueva el access token usando el refresh token', async () => {
    const res = await request(getHttpServer())
      .post('/auth/refresh')
      .send({ refresh_token: refreshToken })
      .expect(201);

    expect(res.body.access_token).toBeDefined();
    expect(res.body.refresh_token).toBeDefined();
    expect(res.body.refresh_token).not.toBe(refreshToken);

    rotatedToken = res.body.refresh_token;
  });

  it('rechaza el refresh token antiguo después de la rotación', async () => {
    await request(getHttpServer())
      .post('/auth/refresh')
      .send({ refresh_token: refreshToken })
      .expect(401);
  });

  it('permite el refresh con el token rotado', async () => {
    const res = await request(getHttpServer())
      .post('/auth/refresh')
      .send({ refresh_token: rotatedToken })
      .expect(201);

    expect(res.body.access_token).toBeDefined();
    rotatedToken = res.body.refresh_token;
  });

  it('cierra sesión e invalida el refresh token', async () => {
    await request(getHttpServer())
      .post('/auth/logout')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ refresh_token: rotatedToken })
      .expect(201);

    await request(getHttpServer())
      .post('/auth/refresh')
      .send({ refresh_token: rotatedToken })
      .expect(401);
  });

  it('bloquea el acceso de un usuario a rutas de administrador', async () => {
    await request(getHttpServer())
      .get('/admins')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(403);
  });
});
