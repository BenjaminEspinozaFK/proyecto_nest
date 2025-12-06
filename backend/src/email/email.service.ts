import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import {
  loginNotificationTemplate,
  loginNotificationSubject,
} from './templates/login-notification.template';
import { welcomeTemplate, welcomeSubject } from './templates/welcome.template';
import {
  passwordResetTemplate,
  passwordResetSubject,
} from './templates/password-reset.template';
import {
  passwordSetupTemplate,
  passwordSetupSubject,
} from './templates/password-setup.template';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private transporter: nodemailer.Transporter;

  constructor() {
    this.validateEnvironmentVariables();
    this.initializeTransporter();
  }

  private validateEnvironmentVariables(): void {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      this.logger.error('❌ Variables de entorno de email no configuradas');
      this.logger.error(
        `EMAIL_USER: ${process.env.EMAIL_USER || 'NO CONFIGURADO'}`,
      );
      this.logger.error(
        `EMAIL_PASS: ${process.env.EMAIL_PASS ? 'CONFIGURADO' : 'NO CONFIGURADO'}`,
      );
      throw new Error('Configuración de email incompleta');
    }
    this.logger.log('✅ Variables de email configuradas correctamente');
  }

  private initializeTransporter(): void {
    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
  }

  /**
   * Método genérico para enviar emails
   */
  private async sendEmail(
    to: string,
    subject: string,
    html: string,
  ): Promise<void> {
    const mailOptions = {
      from: `Tu Aplicación <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html,
    };

    try {
      await this.transporter.sendMail(mailOptions);
      this.logger.log(`✅ Email enviado exitosamente a: ${to}`);
    } catch (error) {
      this.logger.error(`❌ Error enviando email a ${to}:`, error);
      throw new Error(`Failed to send email: ${error.message}`);
    }
  }

  /**
   * Enviar notificación de inicio de sesión
   */
  async sendLoginNotification(
    userEmail: string,
    userName: string,
    userRole: string,
    ipAddress?: string,
    device?: string,
  ): Promise<void> {
    const html = loginNotificationTemplate({
      userName,
      userEmail,
      userRole,
      loginDate: new Date().toLocaleString('es-ES', {
        timeZone: 'America/Santiago',
        dateStyle: 'full',
        timeStyle: 'medium',
      }),
      ipAddress,
      device,
    });

    await this.sendEmail(userEmail, loginNotificationSubject, html);
  }

  /**
   * Enviar email de bienvenida al registrarse
   */
  async sendWelcomeEmail(userEmail: string, userName: string): Promise<void> {
    const html = welcomeTemplate({
      userName,
      userEmail,
    });

    await this.sendEmail(userEmail, welcomeSubject, html);
  }

  /**
   * Enviar email de restablecimiento de contraseña
   */
  async sendPasswordResetEmail(
    userEmail: string,
    userName: string,
    resetToken: string,
    expiresIn: string = '1 hora',
  ): Promise<void> {
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;

    const html = passwordResetTemplate({
      userName,
      resetToken,
      resetUrl,
      expiresIn,
    });

    await this.sendEmail(userEmail, passwordResetSubject, html);
  }

  /**
   * Enviar email de configuración de contraseña inicial
   */
  async sendPasswordSetupEmail(
    userEmail: string,
    userName: string,
    temporaryPassword: string,
  ): Promise<void> {
    const html = passwordSetupTemplate({
      userName,
      userEmail,
      temporaryPassword,
    });

    await this.sendEmail(userEmail, passwordSetupSubject, html);
  }

  /**
   * Verificar la conexión del transporter (útil para health checks)
   */
  async verifyConnection(): Promise<boolean> {
    try {
      await this.transporter.verify();
      this.logger.log('✅ Conexión con servidor de email verificada');
      return true;
    } catch (error) {
      this.logger.error('❌ Error verificando conexión de email:', error);
      return false;
    }
  }
}
