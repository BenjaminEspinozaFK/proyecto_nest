import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { EmailService } from '../email/email.service';
import { ValidatedUser } from './interfaces/validated-user.interface';
import * as bcrypt from 'bcryptjs';

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
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { password: adminPassword, ...result } = admin;
        return { ...result, role: 'admin' };
      }
    } else if (role === 'user') {
      const user = await this.prisma.user.findUnique({
        where: { email },
      });
      if (user && (await bcrypt.compare(password, user.password))) {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
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

    // 📧 Enviar email de notificación de login
    try {
      await this.emailService.sendLoginNotification(
        user.email,
        user.name || 'Usuario', // Si name es null, usar 'Usuario'
        user.role,
      );
    } catch (emailError) {
      console.error('Error enviando email de login:', emailError);
      // No lanzamos error para no interrumpir el login
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
      },
    };
  }

  async register(registerDto: RegisterDto) {
    // Verificar si el usuario ya existe
    const existingUser = await this.prisma.user.findUnique({
      where: { email: registerDto.email },
    });

    if (existingUser) {
      throw new UnauthorizedException('El usuario ya existe');
    }

    // Encriptar la contraseña
    const hashedPassword = await bcrypt.hash(registerDto.password, 10);

    // Crear el usuario
    const user = await this.prisma.user.create({
      data: {
        ...registerDto,
        password: hashedPassword,
      },
    });

    // Retornar el token
    const payload = {
      email: user.email,
      sub: user.id,
      name: user.name,
      role: user.role, // Agregar role al payload
    };

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password: userPassword, ...userWithoutPassword } = user;

    return {
      access_token: this.jwtService.sign(payload),
      user: { ...userWithoutPassword, role: user.role }, // Incluir role en la respuesta
    };
  }
}