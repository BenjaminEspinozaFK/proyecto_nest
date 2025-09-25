import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailService {
  private transporter;

  constructor() {
    // Verificar que las variables de entorno estén configuradas
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      console.error('❌ Variables de entorno de email no configuradas:');
      console.error('EMAIL_USER:', process.env.EMAIL_USER || 'NO CONFIGURADO');
      console.error(
        'EMAIL_PASS:',
        process.env.EMAIL_PASS ? 'CONFIGURADO' : 'NO CONFIGURADO',
      );
    } else {
      console.log('✅ Variables de email configuradas correctamente');
    }

    // Configurar el transportador de Gmail
    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER, // Tu email de Gmail
        pass: process.env.EMAIL_PASS, // Tu contraseña de aplicación de Gmail
      },
    });
  }

  async sendLoginNotification(
    userEmail: string,
    userName: string,
    userRole: string,
  ) {
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: userEmail,
      subject: '🔐 Nuevo inicio de sesión detectado',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">¡Hola ${userName}!</h2>
          <p>Se ha detectado un nuevo inicio de sesión en tu cuenta.</p>
          
          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 5px; margin: 20px 0;">
            <h3 style="color: #28a745; margin-top: 0;">✅ Inicio de sesión exitoso</h3>
            <p><strong>Fecha y hora:</strong> ${new Date().toLocaleString('es-ES')}</p>
            <p><strong>Email:</strong> ${userEmail}</p>
            <p><strong>Rol:</strong> ${userRole}</p>
          </div>
          
          <p style="color: #666;">Si no fuiste tú quien inició sesión, por favor cambia tu contraseña inmediatamente.</p>
          
          <hr style="margin: 30px 0;">
          <p style="color: #999; font-size: 12px;">
            Este es un mensaje automático, no respondas a este email.
          </p>
        </div>
      `,
    };

    try {
      await this.transporter.sendMail(mailOptions);
      console.log(`✅ Email de login enviado a: ${userEmail}`);
    } catch (error) {
      console.error('❌ Error enviando email de login:', error);
      throw error;
    }
  }
}
