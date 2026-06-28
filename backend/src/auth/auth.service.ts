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
    if (role === 'admin') {
      const admin = await this.authRepository.findAdminByEmail(email);
      if (admin && (await bcrypt.compare(password, admin.password))) {
        const { password: adminPassword, ...result } = admin;
        return { ...result, role: 'admin' };
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
      if (user && (await bcrypt.compare(password, user.password))) {
        const { password: userPassword, ...result } = user;
        return { ...result, role: 'user' };
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

  async login(loginDto: LoginDto) {
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

    return this.generateTokens(user);
  }

  private async generateTokens(user: ValidatedUser) {
    const payload = {
      email: user.email,
      sub: user.id,
      name: user.name,
      role: user.role,
    };

    const refreshToken = crypto.randomBytes(40).toString('hex');
    const refreshExpires = new Date();
    refreshExpires.setDate(refreshExpires.getDate() + 30);

    if (user.role === 'admin') {
      await this.authRepository.setAdminRefreshToken(
        user.id,
        refreshToken,
        refreshExpires,
      );
    } else {
      await this.authRepository.setUserRefreshToken(
        user.id,
        refreshToken,
        refreshExpires,
      );
    }

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

    return this.generateTokens(user);
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
    // Buscar en usuarios primero, luego en admins
    let target = await this.authRepository.findUserByRefreshToken(refreshToken);
    let role = 'user';

    if (!target) {
      target = await this.authRepository.findAdminByRefreshToken(refreshToken);
      role = 'admin';
    }

    if (!target) {
      throw new UnauthorizedException('Refresh token inválido o expirado');
    }

    // Obtener perfil completo para generar nuevo token
    const profile =
      role === 'admin'
        ? await this.authRepository.getAdminProfile(target.id)
        : await this.authRepository.getUserProfile(target.id);

    if (!profile) {
      throw new UnauthorizedException('Usuario no encontrado');
    }

    const payload = {
      email: profile.email,
      sub: profile.id,
      name: profile.name,
      role: profile.role,
    };

    // Generar nuevo refresh token (rotación)
    const newRefreshToken = crypto.randomBytes(40).toString('hex');
    const refreshExpires = new Date();
    refreshExpires.setDate(refreshExpires.getDate() + 30);

    if (role === 'admin') {
      await this.authRepository.setAdminRefreshToken(
        target.id,
        newRefreshToken,
        refreshExpires,
      );
    } else {
      await this.authRepository.setUserRefreshToken(
        target.id,
        newRefreshToken,
        refreshExpires,
      );
    }

    return {
      access_token: this.jwtService.sign(payload),
      refresh_token: newRefreshToken,
    };
  }

  async logout(userId: string, role: string) {
    if (role === 'admin') {
      await this.authRepository.clearAdminRefreshToken(userId);
    } else {
      await this.authRepository.clearUserRefreshToken(userId);
    }

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
