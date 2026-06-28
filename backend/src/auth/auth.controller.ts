import {
  Controller,
  Post,
  Body,
  ValidationPipe,
  Get,
  Query,
  UseGuards,
  Req,
} from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { RequestWithUser } from './interfaces/request-with-user.interface';
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
import { Verify2faDto, Login2faDto } from './dto/verify-2fa.dto';
import { JwtAuthGuard } from './jwt-auth.guard';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  @Throttle({ default: { limit: 5, ttl: 60_000 } })
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
          rut: '12345678-9',
        },
      },
    },
  })
  async login(@Body(ValidationPipe) loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Post('register')
  @Throttle({ default: { limit: 5, ttl: 60_000 } })
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
          rut: '12345678-9',
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
  @Throttle({ default: { limit: 3, ttl: 60_000 } })
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
  @Throttle({ default: { limit: 3, ttl: 60_000 } })
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

  @Get('verify-email')
  @ApiOperation({ summary: 'Verificar correo electrónico con token' })
  @ApiResponse({
    status: 200,
    description: 'Correo verificado exitosamente',
  })
  @ApiResponse({
    status: 401,
    description: 'Token inválido o expirado',
  })
  async verifyEmail(@Query('token') token: string) {
    return this.authService.verifyEmail(token);
  }

  @Post('2fa/login')
  @Throttle({ default: { limit: 5, ttl: 60_000 } })
  @ApiOperation({ summary: 'Login con código 2FA' })
  @ApiResponse({ status: 200, description: 'Login con 2FA exitoso' })
  async loginWith2FA(@Body(ValidationPipe) login2faDto: Login2faDto) {
    return this.authService.loginWith2FA(
      login2faDto.email,
      login2faDto.password,
      login2faDto.role,
      login2faDto.code,
    );
  }

  @Post('2fa/generate')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Generar secreto 2FA y código QR' })
  async generate2FA(@Req() req: RequestWithUser) {
    return this.authService.generate2FASecret(req.user.userId);
  }

  @Post('2fa/enable')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Activar 2FA verificando código TOTP' })
  async enable2FA(
    @Req() req: RequestWithUser,
    @Body(ValidationPipe) verify2faDto: Verify2faDto,
  ) {
    return this.authService.enable2FA(req.user.userId, verify2faDto.code);
  }

  @Post('2fa/disable')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Desactivar 2FA' })
  async disable2FA(
    @Req() req: RequestWithUser,
    @Body(ValidationPipe) verify2faDto: Verify2faDto,
  ) {
    return this.authService.disable2FA(req.user.userId, verify2faDto.code);
  }

  /**
   * GET /auth/me
   * Obtiene el perfil del usuario autenticado
   */
  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Obtener perfil del usuario autenticado' })
  async getProfile(@Req() req: RequestWithUser) {
    const userId = req.user.userId;
    const role = req.user.role;
    return this.authService.getProfile(userId, role);
  }
}
