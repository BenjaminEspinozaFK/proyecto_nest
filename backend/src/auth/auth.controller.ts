import {
  Controller,
  Post,
  Delete,
  Param,
  Body,
  ValidationPipe,
  Get,
  Query,
  UseGuards,
  Req,
  Res,
  UnauthorizedException,
} from '@nestjs/common';
import { Request, Response } from 'express';
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
import {
  REFRESH_TOKEN_COOKIE,
  setRefreshTokenCookie,
  clearRefreshTokenCookie,
} from '../common/refresh-token-cookie';

interface TokenResult {
  refresh_token?: string;
  [key: string]: unknown;
}

function sendWithRefreshCookie(res: Response, result: TokenResult) {
  const { refresh_token, ...body } = result;
  if (refresh_token) {
    setRefreshTokenCookie(res, refresh_token);
  }
  return body;
}

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
  async login(
    @Body(ValidationPipe) loginDto: LoginDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.authService.login(loginDto, {
      userAgent: req.headers['user-agent'],
      ipAddress: req.ip,
    });
    return sendWithRefreshCookie(res, result);
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
  async loginWith2FA(
    @Body(ValidationPipe) login2faDto: Login2faDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.authService.loginWith2FA(
      login2faDto.email,
      login2faDto.password,
      login2faDto.role,
      login2faDto.code,
      {
        userAgent: req.headers['user-agent'],
        ipAddress: req.ip,
      },
    );
    return sendWithRefreshCookie(res, result);
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

  @Post('refresh')
  @ApiOperation({ summary: 'Renovar access token con refresh token' })
  @ApiResponse({ status: 200, description: 'Tokens renovados' })
  @ApiResponse({
    status: 401,
    description: 'Refresh token inválido o expirado',
  })
  async refreshTokens(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const refreshToken = (req.cookies as Record<string, string> | undefined)?.[
      REFRESH_TOKEN_COOKIE
    ];
    if (!refreshToken) {
      clearRefreshTokenCookie(res);
      throw new UnauthorizedException('Refresh token inválido o expirado');
    }
    const result = await this.authService.refreshTokens(refreshToken);
    return sendWithRefreshCookie(res, result);
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Cerrar sesión e invalidar refresh token' })
  async logout(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const refreshToken = (req.cookies as Record<string, string> | undefined)?.[
      REFRESH_TOKEN_COOKIE
    ];
    const result = await this.authService.logout(refreshToken);
    clearRefreshTokenCookie(res);
    return result;
  }

  @Get('sessions')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Listar sesiones activas del usuario' })
  async listSessions(@Req() req: RequestWithUser) {
    return this.authService.listSessions(req.user.userId, req.user.role);
  }

  @Delete('sessions/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Cerrar una sesión específica' })
  async revokeSession(
    @Req() req: RequestWithUser,
    @Param('id') sessionId: string,
  ) {
    return this.authService.revokeSession(
      sessionId,
      req.user.userId,
      req.user.role,
    );
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
