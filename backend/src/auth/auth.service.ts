import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { EmailService } from '../email/email.service';
import { ValidatedUser } from './interfaces/validated-user.interface';
import * as bcrypt from 'bcryptjs';
import * as crypto from 'crypto';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private emailService: EmailService,
  ) {}

  async validateUser(
    email: string,
    password: string,
    role: string,
  ): Promise<ValidatedUser | null> {
    if (role === 'admin') {
      const admin = await this.prisma.admin.findUnique({
        where: { email },
      });
      if (admin && (await bcrypt.compare(password, admin.password))) {
        const { password: adminPassword, ...result } = admin;
        return { ...result, role: 'admin' };
      }
    } else if (role === 'user') {
      const user = await this.prisma.user.findUnique({
        where: { email },
      });
      if (user && (await bcrypt.compare(password, user.password))) {
        const { password: userPassword, ...result } = user;
        return { ...result, role: 'user' };
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
        await this.prisma.admin.update({
          where: { id: user.id },
          data: { lastLogin: now },
        });
      } else {
        await this.prisma.user.update({
          where: { id: user.id },
          data: { lastLogin: now },
        });
      }
    } catch (err) {
      console.error('Error actualizando lastLogin:', err);
    }

    const payload = {
      email: user.email,
      sub: user.id,
      name: user.name,
      role: user.role,
    };

    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        age: user.age,
        role: user.role,
        avatar: user.avatar,
        lastLogin: user.lastLogin,
      },
    };
  }

  async register(registerDto: RegisterDto) {
    const existingUser = await this.prisma.user.findUnique({
      where: { email: registerDto.email },
    });

    if (existingUser) {
      throw new UnauthorizedException('El usuario ya existe');
    }

    const hashedPassword = await bcrypt.hash(registerDto.password, 10);

    const user = await this.prisma.user.create({
      data: {
        ...registerDto,
        password: hashedPassword,
      },
    });
    try {
      await this.emailService.sendWelcomeEmail(
        user.email,
        user.name || 'Usuario',
      );
    } catch (emailError) {
      console.error('Error enviando email de bienvenida:', emailError);
    }

    // Retornar el token
    const payload = {
      email: user.email,
      sub: user.id,
      name: user.name,
      role: user.role,
    };

    const { password: userPassword, ...userWithoutPassword } = user;

    return {
      access_token: this.jwtService.sign(payload),
      user: { ...userWithoutPassword, role: user.role, avatar: user.avatar }, // Incluir role en la respuesta
    };
  }
  /**
   * Solicitar reset de contraseña (forgot password)
   */
  async requestPasswordReset(email: string, role: string): Promise<void> {
    // Buscar usuario según el rol
    if (role === 'admin') {
      const admin = await this.prisma.admin.findUnique({ where: { email } });

      if (!admin) {
        // Por seguridad, no revelar si el email existe o no
        console.log(
          `Email ${email} no encontrado, pero no revelamos esto al cliente`,
        );
        return;
      }

      // Generar token aleatorio de 32 bytes
      const resetToken = crypto.randomBytes(32).toString('hex');

      // Token expira en 1 hora
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + 1);

      // Guardar token en DB
      await this.prisma.admin.update({
        where: { id: admin.id },
        data: {
          resetPasswordToken: resetToken,
          resetPasswordExpires: expiresAt,
        },
      });

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
      const user = await this.prisma.user.findUnique({ where: { email } });

      if (!user) {
        // Por seguridad, no revelar si el email existe o no
        console.log(
          `Email ${email} no encontrado, pero no revelamos esto al cliente`,
        );
        return;
      }

      // Generar token aleatorio de 32 bytes
      const resetToken = crypto.randomBytes(32).toString('hex');

      // Token expira en 1 hora
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + 1);

      // Guardar token en DB
      await this.prisma.user.update({
        where: { id: user.id },
        data: {
          resetPasswordToken: resetToken,
          resetPasswordExpires: expiresAt,
        },
      });

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
    let user = await this.prisma.user.findFirst({
      where: {
        resetPasswordToken: token,
        resetPasswordExpires: { gte: now },
      },
    });

    let isAdmin = false;

    if (!user) {
      // Buscar en admins
      const admin = await this.prisma.admin.findFirst({
        where: {
          resetPasswordToken: token,
          resetPasswordExpires: { gte: now },
        },
      });

      if (!admin) {
        throw new UnauthorizedException('Token inválido o expirado');
      }

      user = admin;
      isAdmin = true;
    }

    // Encriptar nueva contraseña
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Actualizar contraseña y limpiar token
    if (isAdmin) {
      await this.prisma.admin.update({
        where: { id: user.id },
        data: {
          password: hashedPassword,
          resetPasswordToken: null,
          resetPasswordExpires: null,
        },
      });
    } else {
      await this.prisma.user.update({
        where: { id: user.id },
        data: {
          password: hashedPassword,
          resetPasswordToken: null,
          resetPasswordExpires: null,
        },
      });
    }
  }
}
