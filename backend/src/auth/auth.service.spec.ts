import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import { AuthRepositoryPort } from './domain/auth.repository';
import { EmailService } from '../email/email.service';
import {
  AuthUser,
  AuthUserProfile,
  AuthAdminProfile,
} from './domain/auth.types';
import { Session } from './domain/session.types';

jest.mock('bcryptjs', () => ({
  hash: jest.fn().mockResolvedValue('hashed-password'),
  compare: jest.fn(),
}));

jest.mock('otplib', () => ({
  generateSecret: jest.fn(() => 'TEST_SECRET'),
  generateURI: jest.fn(() => 'otpauth://totp/test'),
  verifySync: jest.fn(() => ({ valid: true })),
}));

jest.mock('qrcode', () => ({
  toDataURL: jest.fn().mockResolvedValue('data:image/png;base64,xxx'),
}));

import * as bcrypt from 'bcryptjs';
import * as otplib from 'otplib';

describe('AuthService', () => {
  let service: AuthService;
  let repository: jest.Mocked<AuthRepositoryPort>;
  let jwtService: jest.Mocked<JwtService>;
  let emailService: jest.Mocked<EmailService>;

  const mockUser: AuthUser = {
    id: 'user-1',
    email: 'user@test.com',
    password: 'hashed-pass',
    name: 'Usuario',
    rut: '12345678-9',
    phone: '98765432',
    role: 'user',
    avatar: null,
    lastLogin: null,
    failedLoginAttempts: 0,
    lockedUntil: null,
    requirePasswordChange: false,
    emailVerified: true,
    twoFactorEnabled: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const makeSession = (overrides: Partial<Session> = {}): Session => ({
    id: 'session-1',
    userId: 'user-1',
    adminId: null,
    refreshToken: 'rt',
    userAgent: null,
    ipAddress: null,
    createdAt: new Date(),
    lastUsedAt: new Date(),
    expiresAt: new Date(),
    ...overrides,
  });

  const mockUserProfile: AuthUserProfile = {
    id: 'user-1',
    email: 'user@test.com',
    name: 'Usuario',
    rut: '12345678-9',
    role: 'user',
    avatar: null,
    lastLogin: null,
    requirePasswordChange: false,
    emailVerified: true,
    twoFactorEnabled: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockAdminProfile: AuthAdminProfile = {
    id: 'admin-1',
    email: 'admin@test.com',
    name: 'Admin',
    rut: '12345678-9',
    role: 'admin',
    avatar: null,
    lastLogin: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    repository = {
      findAdminByEmail: jest.fn(),
      findUserByEmail: jest.fn(),
      createUser: jest.fn(),
      updateAdminLastLogin: jest.fn(),
      updateUserLastLogin: jest.fn(),
      setAdminResetToken: jest.fn(),
      setUserResetToken: jest.fn(),
      findAdminByResetToken: jest.fn(),
      findUserByResetToken: jest.fn(),
      resetAdminPassword: jest.fn(),
      resetUserPassword: jest.fn(),
      getAdminProfile: jest.fn(),
      getUserProfile: jest.fn(),
      setUserVerificationToken: jest.fn(),
      findUserByVerificationToken: jest.fn(),
      verifyUserEmail: jest.fn(),
      setUserTwoFactorSecret: jest.fn(),
      enableUserTwoFactor: jest.fn(),
      disableUserTwoFactor: jest.fn(),
      getUserTwoFactorSecret: jest.fn(),
      createSession: jest.fn(),
      findSessionByToken: jest.fn(),
      rotateSessionToken: jest.fn(),
      listSessions: jest.fn(),
      findSessionById: jest.fn(),
      deleteSession: jest.fn(),
      incrementUserFailedAttempts: jest.fn(),
      incrementAdminFailedAttempts: jest.fn(),
      lockUserAccount: jest.fn(),
      lockAdminAccount: jest.fn(),
      resetUserFailedAttempts: jest.fn(),
      resetAdminFailedAttempts: jest.fn(),
    };
    jwtService = {
      sign: jest.fn(() => 'signed-token'),
    } as any;
    emailService = {
      sendVerificationEmail: jest.fn().mockResolvedValue(undefined),
      sendLoginNotification: jest.fn().mockResolvedValue(undefined),
      sendPasswordResetEmail: jest.fn().mockResolvedValue(undefined),
      sendPasswordSetupEmail: jest.fn().mockResolvedValue(undefined),
    } as any;
    service = new AuthService(repository, jwtService, emailService);
  });

  describe('validateUser', () => {
    it('devuelve null si el admin no existe', async () => {
      repository.findAdminByEmail.mockResolvedValue(null);

      const result = await service.validateUser('a@test.com', 'pass', 'admin');

      expect(result).toBeNull();
    });

    it('lanza UnauthorizedException si el admin está bloqueado', async () => {
      repository.findAdminByEmail.mockResolvedValue({
        ...mockUser,
        role: 'admin',
        lockedUntil: new Date(Date.now() + 600000),
      });

      await expect(
        service.validateUser('a@test.com', 'pass', 'admin'),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('devuelve el admin validado y resetea los intentos fallidos', async () => {
      repository.findAdminByEmail.mockResolvedValue({
        ...mockUser,
        role: 'admin',
        failedLoginAttempts: 2,
      });
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      repository.resetAdminFailedAttempts.mockResolvedValue();

      const result: any = await service.validateUser(
        'a@test.com',
        'pass',
        'admin',
      );

      expect(result.role).toBe('admin');
      expect(result.password).toBeUndefined();
      expect(repository.resetAdminFailedAttempts).toHaveBeenCalledWith(
        'user-1',
      );
    });

    it('bloquea la cuenta admin tras 5 intentos fallidos', async () => {
      repository.findAdminByEmail.mockResolvedValue({
        ...mockUser,
        role: 'admin',
        failedLoginAttempts: 4,
      });
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);
      repository.lockAdminAccount.mockResolvedValue();

      await expect(
        service.validateUser('a@test.com', 'pass', 'admin'),
      ).rejects.toThrow(UnauthorizedException);
      expect(repository.lockAdminAccount).toHaveBeenCalledTimes(1);
    });

    it('incrementa los intentos fallidos si no llegan al máximo', async () => {
      repository.findAdminByEmail.mockResolvedValue({
        ...mockUser,
        role: 'admin',
        failedLoginAttempts: 1,
      });
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);
      repository.incrementAdminFailedAttempts.mockResolvedValue();

      const result = await service.validateUser('a@test.com', 'pass', 'admin');

      expect(result).toBeNull();
      expect(repository.incrementAdminFailedAttempts).toHaveBeenCalledWith(
        'user-1',
      );
    });

    it('avisa si el email del admin está registrado como usuario', async () => {
      repository.findAdminByEmail.mockResolvedValue({
        ...mockUser,
        role: 'admin',
      });
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);
      repository.findUserByEmail.mockResolvedValue(mockUser);

      await expect(
        service.validateUser('a@test.com', 'pass', 'admin'),
      ).rejects.toThrow(
        new UnauthorizedException(
          'Este correo está registrado como usuario, no como administrador',
        ),
      );
    });

    it('devuelve null si el usuario no existe', async () => {
      repository.findUserByEmail.mockResolvedValue(null);

      const result = await service.validateUser('u@test.com', 'pass', 'user');

      expect(result).toBeNull();
    });

    it('devuelve el usuario validado para rol user', async () => {
      repository.findUserByEmail.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const result: any = await service.validateUser(
        'u@test.com',
        'pass',
        'user',
      );

      expect(result.role).toBe('user');
      expect(result.password).toBeUndefined();
    });

    it('bloquea la cuenta user tras 5 intentos fallidos', async () => {
      repository.findUserByEmail.mockResolvedValue({
        ...mockUser,
        failedLoginAttempts: 4,
      });
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);
      repository.lockUserAccount.mockResolvedValue();

      await expect(
        service.validateUser('u@test.com', 'pass', 'user'),
      ).rejects.toThrow(UnauthorizedException);
      expect(repository.lockUserAccount).toHaveBeenCalledTimes(1);
    });

    it('avisa si el email del usuario está registrado como admin', async () => {
      repository.findUserByEmail.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);
      repository.findAdminByEmail.mockResolvedValue({
        ...mockUser,
        role: 'admin',
      });

      await expect(
        service.validateUser('u@test.com', 'pass', 'user'),
      ).rejects.toThrow(
        new UnauthorizedException(
          'Este correo está registrado como administrador, no como usuario',
        ),
      );
    });
  });

  describe('login', () => {
    it('lanza UnauthorizedException con credenciales inválidas', async () => {
      repository.findUserByEmail.mockResolvedValue(null);

      await expect(
        service.login({ email: 'x@test.com', password: 'x', role: 'user' }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('rechaza el login si el email no está verificado', async () => {
      repository.findUserByEmail.mockResolvedValue({
        ...mockUser,
        emailVerified: false,
      });
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      await expect(
        service.login({ email: 'u@test.com', password: 'pass', role: 'user' }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('devuelve requires2FA si el usuario tiene 2FA activado', async () => {
      repository.findUserByEmail.mockResolvedValue({
        ...mockUser,
        twoFactorEnabled: true,
      });
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const result: any = await service.login({
        email: 'u@test.com',
        password: 'pass',
        role: 'user',
      });

      expect(result.requires2FA).toBe(true);
      expect(repository.createSession).not.toHaveBeenCalled();
    });

    it('envía notificación de primer login y genera tokens', async () => {
      repository.findUserByEmail.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      repository.updateUserLastLogin.mockResolvedValue();
      repository.createSession.mockResolvedValue({
        id: 'session-1',
        userId: 'user-1',
        adminId: null,
        refreshToken: 'rt',
        userAgent: null,
        ipAddress: null,
        createdAt: new Date(),
        lastUsedAt: new Date(),
        expiresAt: new Date(),
      });

      const result: any = await service.login(
        { email: 'u@test.com', password: 'pass', role: 'user' },
        { userAgent: 'agent', ipAddress: 'ip' },
      );

      expect(emailService.sendLoginNotification).toHaveBeenCalledWith(
        'user@test.com',
        'Usuario',
        'user',
      );
      expect(repository.updateUserLastLogin).toHaveBeenCalled();
      expect(repository.createSession).toHaveBeenCalledWith(
        expect.objectContaining({ userId: 'user-1', userAgent: 'agent' }),
      );
      expect(result.access_token).toBe('signed-token');
      expect(result.refresh_token).toBeDefined();
      expect(result.user.email).toBe('user@test.com');
    });

    it('no envía notificación de login si ya inició sesión antes', async () => {
      repository.findUserByEmail.mockResolvedValue({
        ...mockUser,
        lastLogin: new Date(),
      });
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      repository.updateUserLastLogin.mockResolvedValue();
      repository.createSession.mockResolvedValue(
        makeSession({ refreshToken: 'rt' }),
      );

      await service.login({
        email: 'u@test.com',
        password: 'pass',
        role: 'user',
      });

      expect(emailService.sendLoginNotification).not.toHaveBeenCalled();
    });
  });

  describe('register', () => {
    const registerDto = {
      email: 'new@test.com',
      password: 'Password123',
      rut: '12345678-9',
      name: 'Nuevo',
    };

    it('lanza ConflictException si el email ya existe', async () => {
      repository.findUserByEmail.mockResolvedValue(mockUser);

      await expect(service.register(registerDto)).rejects.toThrow(
        ConflictException,
      );
    });

    it('crea el usuario, genera token de verificación y envía email', async () => {
      repository.findUserByEmail.mockResolvedValue(null);
      repository.createUser.mockResolvedValue(mockUser);
      repository.setUserVerificationToken.mockResolvedValue();

      const result = await service.register(registerDto);

      expect(bcrypt.hash).toHaveBeenCalledWith('Password123', 10);
      expect(repository.createUser).toHaveBeenCalledWith({
        ...registerDto,
        password: 'hashed-password',
      });
      expect(repository.setUserVerificationToken).toHaveBeenCalledWith(
        'user-1',
        expect.any(String),
        expect.any(Date),
      );
      expect(emailService.sendVerificationEmail).toHaveBeenCalled();
      expect(result.message).toContain('Registro exitoso');
    });

    it('no fracasa el registro si falla el envío de email', async () => {
      repository.findUserByEmail.mockResolvedValue(null);
      repository.createUser.mockResolvedValue(mockUser);
      emailService.sendVerificationEmail.mockRejectedValue(new Error('smtp'));

      const result = await service.register(registerDto);

      expect(result.message).toContain('Registro exitoso');
    });
  });

  describe('requestPasswordReset', () => {
    it('no revela si el admin no existe', async () => {
      repository.findAdminByEmail.mockResolvedValue(null);

      await expect(
        service.requestPasswordReset('x@test.com', 'admin'),
      ).resolves.toBeUndefined();
    });

    it('guarda token y envía email de reset para admin', async () => {
      repository.findAdminByEmail.mockResolvedValue({
        ...mockUser,
        role: 'admin',
      });

      await service.requestPasswordReset('a@test.com', 'admin');

      expect(repository.setAdminResetToken).toHaveBeenCalledWith(
        'user-1',
        expect.any(String),
        expect.any(Date),
      );
      expect(emailService.sendPasswordResetEmail).toHaveBeenCalled();
    });

    it('lanza UnauthorizedException si el email no se puede enviar', async () => {
      repository.findUserByEmail.mockResolvedValue(mockUser);
      emailService.sendPasswordResetEmail.mockRejectedValue(new Error('smtp'));

      await expect(
        service.requestPasswordReset('u@test.com', 'user'),
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('resetPassword', () => {
    it('lanza UnauthorizedException si el token es inválido', async () => {
      repository.findUserByResetToken.mockResolvedValue(null);
      repository.findAdminByResetToken.mockResolvedValue(null);

      await expect(
        service.resetPassword('bad-token', 'Pass123!'),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('resetea la contraseña de un usuario', async () => {
      repository.findUserByResetToken.mockResolvedValue({ id: 'user-1' });

      await service.resetPassword('token', 'Pass123!');

      expect(bcrypt.hash).toHaveBeenCalledWith('Pass123!', 10);
      expect(repository.resetUserPassword).toHaveBeenCalledWith(
        'user-1',
        'hashed-password',
      );
    });

    it('resetea la contraseña de un admin', async () => {
      repository.findUserByResetToken.mockResolvedValue(null);
      repository.findAdminByResetToken.mockResolvedValue({ id: 'admin-1' });

      await service.resetPassword('token', 'Pass123!');

      expect(repository.resetAdminPassword).toHaveBeenCalledWith(
        'admin-1',
        'hashed-password',
      );
    });
  });

  describe('verifyEmail', () => {
    it('lanza UnauthorizedException si el token es inválido', async () => {
      repository.findUserByVerificationToken.mockResolvedValue(null);

      await expect(service.verifyEmail('bad')).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('verifica el email y devuelve mensaje', async () => {
      repository.findUserByVerificationToken.mockResolvedValue({
        id: 'user-1',
      });
      repository.verifyUserEmail.mockResolvedValue();

      const result = await service.verifyEmail('good');

      expect(repository.verifyUserEmail).toHaveBeenCalledWith('user-1');
      expect(result.message).toContain('verificado');
    });
  });

  describe('loginWith2FA', () => {
    it('lanza UnauthorizedException si las credenciales son inválidas', async () => {
      repository.findUserByEmail.mockResolvedValue(null);

      await expect(
        service.loginWith2FA('u@test.com', 'pass', 'user', '123456'),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('lanza UnauthorizedException si 2FA no está habilitado', async () => {
      repository.findUserByEmail.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      await expect(
        service.loginWith2FA('u@test.com', 'pass', 'user', '123456'),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('lanza UnauthorizedException si no hay secreto 2FA', async () => {
      repository.findUserByEmail.mockResolvedValue({
        ...mockUser,
        twoFactorEnabled: true,
      });
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      repository.getUserTwoFactorSecret.mockResolvedValue(null);

      await expect(
        service.loginWith2FA('u@test.com', 'pass', 'user', '123456'),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('lanza UnauthorizedException si el código es inválido', async () => {
      repository.findUserByEmail.mockResolvedValue({
        ...mockUser,
        twoFactorEnabled: true,
      });
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      repository.getUserTwoFactorSecret.mockResolvedValue({
        twoFactorSecret: 'secret',
      });
      (otplib.verifySync as jest.Mock).mockReturnValue({ valid: false });

      await expect(
        service.loginWith2FA('u@test.com', 'pass', 'user', '123456'),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('genera tokens si el código es válido', async () => {
      repository.findUserByEmail.mockResolvedValue({
        ...mockUser,
        twoFactorEnabled: true,
      });
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      repository.getUserTwoFactorSecret.mockResolvedValue({
        twoFactorSecret: 'secret',
      });
      (otplib.verifySync as jest.Mock).mockReturnValue({ valid: true });
      repository.createSession.mockResolvedValue(
        makeSession({ refreshToken: 'rt' }),
      );

      const result: any = await service.loginWith2FA(
        'u@test.com',
        'pass',
        'user',
        '123456',
      );

      expect(result.access_token).toBe('signed-token');
      expect(repository.updateUserLastLogin).toHaveBeenCalled();
    });
  });

  describe('2FA (generate/enable/disable)', () => {
    it('lanza UnauthorizedException al generar secreto si el usuario no existe', async () => {
      repository.getUserProfile.mockResolvedValue(null);

      await expect(service.generate2FASecret('user-1')).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('genera un secreto y un QR', async () => {
      repository.getUserProfile.mockResolvedValue(mockUserProfile);

      const result = await service.generate2FASecret('user-1');

      expect(repository.setUserTwoFactorSecret).toHaveBeenCalledWith(
        'user-1',
        'TEST_SECRET',
      );
      expect(result.secret).toBe('TEST_SECRET');
      expect(result.qrCode).toContain('data:image/png;base64,xxx');
    });

    it('lanza UnauthorizedException al activar 2FA sin secreto previo', async () => {
      repository.getUserTwoFactorSecret.mockResolvedValue(null);

      await expect(service.enable2FA('user-1', '123456')).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('activa 2FA con un código válido', async () => {
      repository.getUserTwoFactorSecret.mockResolvedValue({
        twoFactorSecret: 'secret',
      });
      repository.enableUserTwoFactor.mockResolvedValue();

      const result = await service.enable2FA('user-1', '123456');

      expect(repository.enableUserTwoFactor).toHaveBeenCalledWith('user-1');
      expect(result.message).toContain('activada');
    });

    it('lanza UnauthorizedException al desactivar 2FA sin configuración', async () => {
      repository.getUserTwoFactorSecret.mockResolvedValue(null);

      await expect(service.disable2FA('user-1', '123456')).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('desactiva 2FA con un código válido', async () => {
      repository.getUserTwoFactorSecret.mockResolvedValue({
        twoFactorSecret: 'secret',
      });
      repository.disableUserTwoFactor.mockResolvedValue();

      const result = await service.disable2FA('user-1', '123456');

      expect(repository.disableUserTwoFactor).toHaveBeenCalledWith('user-1');
      expect(result.message).toContain('desactivada');
    });
  });

  describe('refreshTokens', () => {
    it('lanza UnauthorizedException si no encuentra la sesión', async () => {
      repository.findSessionByToken.mockResolvedValue(null);

      await expect(service.refreshTokens('bad')).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('lanza UnauthorizedException si no encuentra el perfil', async () => {
      repository.findSessionByToken.mockResolvedValue({
        id: 'session-1',
        userId: 'user-1',
        adminId: null,
        refreshToken: 'rt',
        createdAt: new Date(),
        lastUsedAt: new Date(),
        expiresAt: new Date(),
        userAgent: null,
        ipAddress: null,
      });
      repository.getUserProfile.mockResolvedValue(null);

      await expect(service.refreshTokens('rt')).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('rota el refresh token y devuelve un nuevo access token', async () => {
      repository.findSessionByToken.mockResolvedValue({
        id: 'session-1',
        userId: 'user-1',
        adminId: null,
        refreshToken: 'old-rt',
        createdAt: new Date(),
        lastUsedAt: new Date(),
        expiresAt: new Date(),
        userAgent: null,
        ipAddress: null,
      });
      repository.getUserProfile.mockResolvedValue(mockUserProfile);
      repository.rotateSessionToken.mockResolvedValue();

      const result = await service.refreshTokens('old-rt');

      expect(repository.rotateSessionToken).toHaveBeenCalledWith(
        'session-1',
        expect.any(String),
        expect.any(Date),
      );
      expect(result.access_token).toBe('signed-token');
      expect(result.refresh_token).not.toBe('old-rt');
    });
  });

  describe('logout / sessions', () => {
    it('elimina la sesión si se provee refresh token', async () => {
      repository.findSessionByToken.mockResolvedValue({
        id: 'session-1',
        userId: 'user-1',
        adminId: null,
        refreshToken: 'rt',
        createdAt: new Date(),
        lastUsedAt: new Date(),
        expiresAt: new Date(),
        userAgent: null,
        ipAddress: null,
      });
      repository.deleteSession.mockResolvedValue();

      const result = await service.logout('rt');

      expect(repository.deleteSession).toHaveBeenCalledWith('session-1');
      expect(result.message).toContain('Sesión cerrada');
    });

    it('devuelve mensaje sin token aunque no exista sesión', async () => {
      repository.findSessionByToken.mockResolvedValue(null);

      const result = await service.logout();

      expect(result.message).toContain('Sesión cerrada');
    });

    it('lista y mapea las sesiones', async () => {
      repository.listSessions.mockResolvedValue([
        {
          id: 'session-1',
          userId: 'user-1',
          adminId: null,
          refreshToken: 'rt',
          userAgent: 'agent',
          ipAddress: 'ip',
          createdAt: new Date(),
          lastUsedAt: new Date(),
          expiresAt: new Date(),
        },
      ]);

      const result = await service.listSessions('user-1', 'user');

      expect(result).toEqual([
        expect.objectContaining({ id: 'session-1', userAgent: 'agent' }),
      ]);
      expect((result[0] as any).refreshToken).toBeUndefined();
    });

    it('revoca la sesión si pertenece al usuario', async () => {
      repository.findSessionById.mockResolvedValue({
        id: 'session-1',
        userId: 'user-1',
        adminId: null,
        refreshToken: 'rt',
        createdAt: new Date(),
        lastUsedAt: new Date(),
        expiresAt: new Date(),
        userAgent: null,
        ipAddress: null,
      });
      repository.deleteSession.mockResolvedValue();

      const result = await service.revokeSession('session-1', 'user-1', 'user');

      expect(repository.deleteSession).toHaveBeenCalledWith('session-1');
      expect(result.message).toContain('Sesión cerrada');
    });

    it('no permite revocar una sesión ajena', async () => {
      repository.findSessionById.mockResolvedValue({
        id: 'session-1',
        userId: 'otro-user',
        adminId: null,
        refreshToken: 'rt',
        createdAt: new Date(),
        lastUsedAt: new Date(),
        expiresAt: new Date(),
        userAgent: null,
        ipAddress: null,
      });

      await expect(
        service.revokeSession('session-1', 'user-1', 'user'),
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('getProfile', () => {
    it('devuelve el perfil del admin', async () => {
      repository.getAdminProfile.mockResolvedValue(mockAdminProfile);

      const result = await service.getProfile('admin-1', 'admin');

      expect(repository.getAdminProfile).toHaveBeenCalledWith('admin-1');
      expect(result).toEqual(mockAdminProfile);
    });

    it('devuelve el perfil del usuario', async () => {
      repository.getUserProfile.mockResolvedValue(mockUserProfile);

      const result = await service.getProfile('user-1', 'user');

      expect(repository.getUserProfile).toHaveBeenCalledWith('user-1');
      expect(result).toEqual(mockUserProfile);
    });
  });
});
