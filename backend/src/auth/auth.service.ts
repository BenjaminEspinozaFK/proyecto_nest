import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  Inject,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { EmailService } from '../email/email.service';
import { ValidatedUser } from './interfaces/validated-user.interface';
import { AuthRepositoryPort } from './domain/auth.repository';
import { AUTH_REPOSITORY } from './auth.tokens';
import * as bcrypt from 'bcryptjs';
import * as crypto from 'crypto';
import { generateSecret, generateURI, verifySync } from 'otplib';
import * as QRCode from 'qrcode';

@Injectable()
export class AuthService {
  constructor(
    @Inject(AUTH_REPOSITORY) private authRepository: AuthRepositoryPort,
    private jwtService: JwtService,
    private emailService: EmailService,
  ) {}

  async validateUser(
    email: string,
    password: string,
    role: string,
  ): Promise<ValidatedUser | null> {
    const MAX_ATTEMPTS = 5;
    const LOCK_MINUTES = 15;

    if (role === 'admin') {
      const admin = await this.authRepository.findAdminByEmail(email);

      if (!admin) {
        return null;
      }

      // Verificar si la cuenta está bloqueada
      if (admin.lockedUntil && admin.lockedUntil > new Date()) {
        const minutesLeft = Math.ceil(
          (admin.lockedUntil.getTime() - Date.now()) / 60000,
        );
        throw new UnauthorizedException(
          `Cuenta bloqueada por intentos fallidos. Intenta de nuevo en ${minutesLeft} minuto(s).`,
        );
      }

      const isValid = await bcrypt.compare(password, admin.password);

      if (isValid) {
        if (admin.failedLoginAttempts > 0) {
          await this.authRepository.resetAdminFailedAttempts(admin.id);
        }
        const { password: adminPassword, ...result } = admin;
        return { ...result, role: 'admin' };
      }

      // Contraseña incorrecta: incrementar intentos
      const newAttempts = admin.failedLoginAttempts + 1;
      if (newAttempts >= MAX_ATTEMPTS) {
        const until = new Date();
        until.setMinutes(until.getMinutes() + LOCK_MINUTES);
        await this.authRepository.lockAdminAccount(admin.id, until);
        throw new UnauthorizedException(
          `Cuenta bloqueada por ${LOCK_MINUTES} minutos debido a múltiples intentos fallidos.`,
        );
      } else {
        await this.authRepository.incrementAdminFailedAttempts(admin.id);
      }

      // Verificar si el email existe como usuario
      const userExists = await this.authRepository.findUserByEmail(email);
      if (userExists) {
        throw new UnauthorizedException(
          'Este correo está registrado como usuario, no como administrador',
        );
      }
    } else if (role === 'user') {
      const user = await this.authRepository.findUserByEmail(email);

      if (!user) {
        return null;
      }

      // Verificar si la cuenta está bloqueada
      if (user.lockedUntil && user.lockedUntil > new Date()) {
        const minutesLeft = Math.ceil(
          (user.lockedUntil.getTime() - Date.now()) / 60000,
        );
        throw new UnauthorizedException(
          `Cuenta bloqueada por intentos fallidos. Intenta de nuevo en ${minutesLeft} minuto(s).`,
        );
      }

      const isValid = await bcrypt.compare(password, user.password);

      if (isValid) {
        if (user.failedLoginAttempts > 0) {
          await this.authRepository.resetUserFailedAttempts(user.id);
        }
        const { password: userPassword, ...result } = user;
        return { ...result, role: 'user' };
      }

      // Contraseña incorrecta: incrementar intentos
      const newAttempts = user.failedLoginAttempts + 1;
      if (newAttempts >= MAX_ATTEMPTS) {
        const until = new Date();
        until.setMinutes(until.getMinutes() + LOCK_MINUTES);
        await this.authRepository.lockUserAccount(user.id, until);
        throw new UnauthorizedException(
          `Cuenta bloqueada por ${LOCK_MINUTES} minutos debido a múltiples intentos fallidos.`,
        );
      } else {
        await this.authRepository.incrementUserFailedAttempts(user.id);
      }

      // Verificar si el email existe como admin
      const adminExists = await this.authRepository.findAdminByEmail(email);
      if (adminExists) {
        throw new UnauthorizedException(
          'Este correo está registrado como administrador, no como usuario',
        );
      }
    }
    return null;
  }

  async login(
    loginDto: LoginDto,
    meta?: { userAgent?: string; ipAddress?: string },
  ) {
    const user = await this.validateUser(
      loginDto.email,
      loginDto.password,
      loginDto.role,
    );

    if (!user) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    // Verificar si el email está confirmado (solo para usuarios, no admins)
    if (user.role === 'user' && !user.emailVerified) {
      throw new UnauthorizedException(
        'Debes verificar tu correo electrónico antes de iniciar sesión',
      );
    }

    // Si tiene 2FA activado, no dar token aún — pedir código
    if (user.twoFactorEnabled) {
      return {
        requires2FA: true,
        message: 'Se requiere código de autenticación de dos factores',
      };
    }

    const isFirstLogin = !user.lastLogin;
    if (isFirstLogin) {
      // 📧 Enviar email de notificación de login
      try {
        await this.emailService.sendLoginNotification(
          user.email,
          user.name || 'Usuario',
          user.role,
        );
      } catch (emailError) {
        console.error('Error enviando email de login:', emailError);
      }
    }

    try {
      const now = new Date();
      if (user.role === 'admin') {
        await this.authRepository.updateAdminLastLogin(user.id, now);
      } else {
        await this.authRepository.updateUserLastLogin(user.id, now);
      }
    } catch (err) {
      console.error('Error actualizando lastLogin:', err);
    }

    return this.generateTokens(user, meta);
  }

  private async generateTokens(
    user: ValidatedUser,
    meta?: { userAgent?: string; ipAddress?: string },
  ) {
    const payload = {
      email: user.email,
      sub: user.id,
      name: user.name,
      role: user.role,
    };

    const refreshToken = crypto.randomBytes(40).toString('hex');
    const refreshExpires = new Date();
    refreshExpires.setDate(refreshExpires.getDate() + 30);

    await this.authRepository.createSession({
      ...(user.role === 'admin' ? { adminId: user.id } : { userId: user.id }),
      refreshToken,
      expiresAt: refreshExpires,
      userAgent: meta?.userAgent,
      ipAddress: meta?.ipAddress,
    });

    return {
      access_token: this.jwtService.sign(payload),
      refresh_token: refreshToken,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        rut: user.rut,
        phone: user.phone,
        role: user.role,
        avatar: user.avatar,
        lastLogin: user.lastLogin,
        requirePasswordChange: user.requirePasswordChange || false,
      },
    };
  }

  async register(registerDto: RegisterDto) {
    const existingUser = await this.authRepository.findUserByEmail(
      registerDto.email,
    );

    if (existingUser) {
      throw new ConflictException('El usuario ya existe');
    }

    const hashedPassword = await bcrypt.hash(registerDto.password, 10);

    const user = await this.authRepository.createUser({
      ...registerDto,
      password: hashedPassword,
    });

    // Generar token de verificación
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24);

    await this.authRepository.setUserVerificationToken(
      user.id,
      verificationToken,
      expiresAt,
    );

    // Enviar email de verificación
    try {
      await this.emailService.sendVerificationEmail(
        user.email,
        user.name || 'Usuario',
        verificationToken,
      );
    } catch (emailError) {
      console.error('Error enviando email de verificación:', emailError);
    }

    return {
      message: 'Registro exitoso. Revisa tu correo para verificar tu cuenta.',
    };
  }
  /**
   * Solicitar reset de contraseña (forgot password)
   */
  async requestPasswordReset(email: string, role: string): Promise<void> {
    // Buscar usuario según el rol
    if (role === 'admin') {
      const admin = await this.authRepository.findAdminByEmail(email);

      if (!admin) {
        // Por seguridad, no revelar si el email existe o no
        return;
      }

      // Generar token aleatorio de 32 bytes
      const resetToken = crypto.randomBytes(32).toString('hex');

      // Token expira en 1 hora
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + 1);

      // Guardar token en DB
      await this.authRepository.setAdminResetToken(
        admin.id,
        resetToken,
        expiresAt,
      );

      // Enviar email con el token
      try {
        await this.emailService.sendPasswordResetEmail(
          admin.email,
          admin.name || 'Usuario',
          resetToken,
          '1 hora',
        );
      } catch (emailError) {
        console.error('Error enviando email de reset:', emailError);
        throw new UnauthorizedException(
          'No se pudo enviar el email de recuperación',
        );
      }
    } else {
      const user = await this.authRepository.findUserByEmail(email);

      if (!user) {
        // Por seguridad, no revelar si el email existe o no
        return;
      }

      // Generar token aleatorio de 32 bytes
      const resetToken = crypto.randomBytes(32).toString('hex');

      // Token expira en 1 hora
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + 1);

      // Guardar token en DB
      await this.authRepository.setUserResetToken(
        user.id,
        resetToken,
        expiresAt,
      );

      // Enviar email con el token
      try {
        await this.emailService.sendPasswordResetEmail(
          user.email,
          user.name || 'Usuario',
          resetToken,
          '1 hora',
        );
      } catch (emailError) {
        console.error('Error enviando email de reset:', emailError);
        throw new UnauthorizedException(
          'No se pudo enviar el email de recuperación',
        );
      }
    }
  }

  /**
   * Resetear contraseña con token
   */
  async resetPassword(token: string, newPassword: string): Promise<void> {
    const now = new Date();

    // Buscar usuario con ese token válido (no expirado)
    let user = await this.authRepository.findUserByResetToken(token, now);

    let isAdmin = false;

    if (!user) {
      // Buscar en admins
      const admin = await this.authRepository.findAdminByResetToken(token, now);

      if (!admin) {
        throw new UnauthorizedException('Token inválido o expirado');
      }

      // Admin no tiene requirePasswordChange, por eso lo agregamos manualmente
      user = admin;
      isAdmin = true;
    }

    if (!user) {
      throw new UnauthorizedException('Token inválido o expirado');
    }

    // Encriptar nueva contraseña
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Actualizar contraseña y limpiar token
    if (isAdmin) {
      await this.authRepository.resetAdminPassword(user.id, hashedPassword);
    } else {
      await this.authRepository.resetUserPassword(user.id, hashedPassword);
    }
  }
  async verifyEmail(token: string) {
    const now = new Date();
    const user = await this.authRepository.findUserByVerificationToken(
      token,
      now,
    );

    if (!user) {
      throw new UnauthorizedException(
        'Token de verificación inválido o expirado',
      );
    }

    await this.authRepository.verifyUserEmail(user.id);

    return {
      message:
        'Correo electrónico verificado exitosamente. Ya puedes iniciar sesión.',
    };
  }

  async loginWith2FA(
    email: string,
    password: string,
    role: string,
    code: string,
    meta?: { userAgent?: string; ipAddress?: string },
  ) {
    const user = await this.validateUser(email, password, role);

    if (!user) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    if (!user.twoFactorEnabled) {
      throw new UnauthorizedException(
        '2FA no está habilitado para esta cuenta',
      );
    }

    // Obtener el secreto 2FA
    const userData = await this.authRepository.getUserTwoFactorSecret(user.id);
    if (!userData?.twoFactorSecret) {
      throw new UnauthorizedException('Error en la configuración de 2FA');
    }

    // Verificar el código TOTP
    const result = verifySync({
      secret: userData.twoFactorSecret,
      token: code,
    });

    if (!result.valid) {
      throw new UnauthorizedException('Código de autenticación inválido');
    }

    // Actualizar lastLogin
    try {
      const now = new Date();
      await this.authRepository.updateUserLastLogin(user.id, now);
    } catch (err) {
      console.error('Error actualizando lastLogin:', err);
    }

    return this.generateTokens(user, meta);
  }

  async generate2FASecret(userId: string) {
    const user = await this.authRepository.getUserProfile(userId);
    if (!user) {
      throw new UnauthorizedException('Usuario no encontrado');
    }

    const secret = generateSecret();

    // Guardar el secreto (aún no activado)
    await this.authRepository.setUserTwoFactorSecret(userId, secret);

    const otpauthUrl = generateURI({
      issuer: 'TuAplicacion',
      label: user.email,
      secret,
    });

    const qrCodeDataUrl = await QRCode.toDataURL(otpauthUrl);

    return {
      secret,
      qrCode: qrCodeDataUrl,
    };
  }

  async enable2FA(userId: string, code: string) {
    const userData = await this.authRepository.getUserTwoFactorSecret(userId);
    if (!userData?.twoFactorSecret) {
      throw new UnauthorizedException('Primero debes generar un secreto 2FA');
    }

    const result = verifySync({
      secret: userData.twoFactorSecret,
      token: code,
    });

    if (!result.valid) {
      throw new UnauthorizedException(
        'Código inválido. Verifica que tu app de autenticación esté configurada correctamente.',
      );
    }

    await this.authRepository.enableUserTwoFactor(userId);

    return { message: 'Autenticación de dos factores activada exitosamente' };
  }

  async disable2FA(userId: string, code: string) {
    const userData = await this.authRepository.getUserTwoFactorSecret(userId);
    if (!userData?.twoFactorSecret) {
      throw new UnauthorizedException('2FA no está configurado');
    }

    const result = verifySync({
      secret: userData.twoFactorSecret,
      token: code,
    });

    if (!result.valid) {
      throw new UnauthorizedException('Código inválido');
    }

    await this.authRepository.disableUserTwoFactor(userId);

    return { message: 'Autenticación de dos factores desactivada' };
  }

  async refreshTokens(refreshToken: string) {
    const session = await this.authRepository.findSessionByToken(refreshToken);

    if (!session) {
      throw new UnauthorizedException('Refresh token inválido o expirado');
    }

    const role = session.adminId ? 'admin' : 'user';
    const ownerId = (session.adminId ?? session.userId) as string;

    const profile =
      role === 'admin'
        ? await this.authRepository.getAdminProfile(ownerId)
        : await this.authRepository.getUserProfile(ownerId);

    if (!profile) {
      throw new UnauthorizedException('Usuario no encontrado');
    }

    const payload = {
      email: profile.email,
      sub: profile.id,
      name: profile.name,
      role: profile.role,
    };

    const newRefreshToken = crypto.randomBytes(40).toString('hex');
    const refreshExpires = new Date();
    refreshExpires.setDate(refreshExpires.getDate() + 30);

    await this.authRepository.rotateSessionToken(
      session.id,
      newRefreshToken,
      refreshExpires,
    );

    return {
      access_token: this.jwtService.sign(payload),
      refresh_token: newRefreshToken,
    };
  }

  async logout(refreshToken?: string) {
    if (refreshToken) {
      const session =
        await this.authRepository.findSessionByToken(refreshToken);
      if (session) {
        await this.authRepository.deleteSession(session.id);
      }
    }

    return { message: 'Sesión cerrada correctamente' };
  }

  async listSessions(userId: string, role: string) {
    const sessions = await this.authRepository.listSessions(userId, role);

    return sessions.map((session) => ({
      id: session.id,
      userAgent: session.userAgent,
      ipAddress: session.ipAddress,
      createdAt: session.createdAt,
      lastUsedAt: session.lastUsedAt,
    }));
  }

  async revokeSession(sessionId: string, userId: string, role: string) {
    const session = await this.authRepository.findSessionById(sessionId);

    if (!session) {
      throw new UnauthorizedException('Sesión no encontrada');
    }

    const belongsToUser =
      role === 'admin' ? session.adminId === userId : session.userId === userId;

    if (!belongsToUser) {
      throw new UnauthorizedException('No puedes cerrar esta sesión');
    }

    await this.authRepository.deleteSession(sessionId);

    return { message: 'Sesión cerrada correctamente' };
  }

  async getProfile(userId: string, role: string) {
    if (role === 'admin') {
      return this.authRepository.getAdminProfile(userId);
    } else {
      return this.authRepository.getUserProfile(userId);
    }
  }
}
