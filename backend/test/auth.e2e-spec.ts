import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import type { App } from 'supertest/types';
import cookieParser from 'cookie-parser';
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

  const getHttpServer = (): App => app.getHttpServer();

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

  const extractRefreshCookie = (res: request.Response): string => {
    const rawCookies = res.headers['set-cookie'] as unknown as
      string[] | undefined;
    const cookie = rawCookies?.find((c) => c.startsWith('refresh_token='));
    if (!cookie) {
      throw new Error('No se recibió la cookie refresh_token');
    }
    return cookie.split(';')[0];
  };

  let accessToken: string;
  let refreshCookie: string;
  let rotatedCookie: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(EmailService)
      .useValue(mockEmailService)
      .compile();

    app = moduleFixture.createNestApplication();
    app.use(cookieParser());
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
    if (prisma) {
      await prisma.session.deleteMany({
        where: { user: { email: { startsWith: 'auth-e2e-' } } },
      });
      await prisma.user.deleteMany({
        where: { email: { startsWith: 'auth-e2e-' } },
      });
    }
    await app?.close();
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

  it('inicia sesión y devuelve access_token y una cookie httpOnly con el refresh token', async () => {
    const res = await request(getHttpServer())
      .post('/auth/login')
      .send({ email, password, role: 'user' })
      .expect(201);

    expect(res.body.access_token).toBeDefined();
    expect(res.body.refresh_token).toBeUndefined();
    expect(res.body.user.email).toBe(email);
    expect(res.body.user.role).toBe('user');

    const rawCookies = res.headers['set-cookie'] as unknown as string[];
    const cookie = rawCookies.find((c) => c.startsWith('refresh_token='));
    expect(cookie).toBeDefined();
    expect(cookie).toContain('HttpOnly');

    accessToken = res.body.access_token;
    refreshCookie = extractRefreshCookie(res);
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

  it('renueva el access token usando la cookie de refresh token', async () => {
    const res = await request(getHttpServer())
      .post('/auth/refresh')
      .set('Cookie', refreshCookie)
      .expect(201);

    expect(res.body.access_token).toBeDefined();
    expect(res.body.refresh_token).toBeUndefined();

    rotatedCookie = extractRefreshCookie(res);
    expect(rotatedCookie).not.toBe(refreshCookie);
  });

  it('rechaza la cookie de refresh token antigua después de la rotación', async () => {
    await request(getHttpServer())
      .post('/auth/refresh')
      .set('Cookie', refreshCookie)
      .expect(401);
  });

  it('permite el refresh con la cookie rotada', async () => {
    const res = await request(getHttpServer())
      .post('/auth/refresh')
      .set('Cookie', rotatedCookie)
      .expect(201);

    expect(res.body.access_token).toBeDefined();
    rotatedCookie = extractRefreshCookie(res);
  });

  it('cierra sesión, invalida el refresh token y limpia la cookie', async () => {
    const res = await request(getHttpServer())
      .post('/auth/logout')
      .set('Authorization', `Bearer ${accessToken}`)
      .set('Cookie', rotatedCookie)
      .expect(201);

    const rawCookies = res.headers['set-cookie'] as unknown as string[];
    const clearedCookie = rawCookies?.find((c) =>
      c.startsWith('refresh_token='),
    );
    expect(clearedCookie).toContain('refresh_token=;');

    await request(getHttpServer())
      .post('/auth/refresh')
      .set('Cookie', rotatedCookie)
      .expect(401);
  });

  it('bloquea el acceso de un usuario a rutas de administrador', async () => {
    await request(getHttpServer())
      .get('/admins')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(403);
  });
});
