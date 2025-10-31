import {
  Controller,
  Post,
  Body,
  ValidationPipe,
  Get,
  UseGuards,
  Req,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { JwtAuthGuard } from './jwt-auth.guard';
import { PrismaService } from '../prisma.service';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private prisma: PrismaService,
  ) {}

  @Post('login')
  @ApiOperation({ summary: 'Iniciar sesión' })
  @ApiResponse({
    status: 200,
    description: 'Login exitoso',
    schema: {
      example: {
        access_token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        user: {
          id: 'cmd123',
          email: 'usuario@test.com',
          name: 'Usuario Test',
          age: 25,
        },
      },
    },
  })
  async login(@Body(ValidationPipe) loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Post('register')
  @ApiOperation({ summary: 'Registrar nuevo usuario' })
  @ApiResponse({
    status: 201,
    description: 'Usuario registrado exitosamente',
    schema: {
      example: {
        access_token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        user: {
          id: 'cmd123',
          email: 'usuario@test.com',
          name: 'Usuario Test',
          age: 25,
          createdAt: '2025-07-25T00:00:00.000Z',
          updatedAt: '2025-07-25T00:00:00.000Z',
        },
      },
    },
  })
  async register(@Body(ValidationPipe) registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  /**
   * POST /auth/forgot-password
   */
  @Post('forgot-password')
  @ApiOperation({ summary: 'Solicitar recuperación de contraseña' })
  @ApiResponse({
    status: 200,
    description: 'Email de recuperación enviado',
  })
  async forgotPassword(
    @Body(ValidationPipe) forgotPasswordDto: ForgotPasswordDto,
  ) {
    await this.authService.requestPasswordReset(
      forgotPasswordDto.email,
      forgotPasswordDto.role,
    );

    return {
      message: 'Si el email existe, recibirás un enlace de recuperación',
    };
  }

  /**
   * POST /auth/reset-password
   */
  @Post('reset-password')
  @ApiOperation({ summary: 'Restablecer contraseña con token' })
  @ApiResponse({
    status: 200,
    description: 'Contraseña actualizada',
  })
  @ApiResponse({
    status: 401,
    description: 'Token inválido o expirado',
  })
  async resetPassword(
    @Body(ValidationPipe) resetPasswordDto: ResetPasswordDto,
  ) {
    await this.authService.resetPassword(
      resetPasswordDto.token,
      resetPasswordDto.newPassword,
    );

    return {
      message: 'Contraseña actualizada correctamente',
    };
  }

  /**
   * GET /auth/me
   * Obtiene el perfil del usuario autenticado
   */
  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Obtener perfil del usuario autenticado' })
  @ApiResponse({
    status: 200,
    description: 'Perfil del usuario',
    schema: {
      example: {
        id: 'cmd123',
        email: 'usuario@test.com',
        name: 'Usuario Test',
        age: 25,
        role: 'user',
        avatar: '/uploads/avatars/1234567890.jpg',
        lastLogin: '2025-10-31T00:00:00.000Z',
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'No autenticado',
  })
  async getProfile(@Req() req: any) {
    const userId = req.user?.sub;
    const role = req.user?.role;

    if (role === 'admin') {
      const admin = await this.prisma.admin.findUnique({
        where: { id: userId },
        select: {
          id: true,
          email: true,
          name: true,
          age: true,
          role: true,
          avatar: true,
          lastLogin: true,
          createdAt: true,
          updatedAt: true,
        },
      });
      return admin;
    } else {
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          email: true,
          name: true,
          age: true,
          role: true,
          avatar: true,
          lastLogin: true,
          createdAt: true,
          updatedAt: true,
        },
      });
      return user;
    }
  }
}
