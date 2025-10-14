import { baseTemplate } from './base.template';

interface PasswordResetData {
  userName: string;
  resetToken: string;
  resetUrl: string;
  expiresIn: string; // ej: "1 hora"
}

export const passwordResetTemplate = (data: PasswordResetData): string => {
  const content = `
    <h2 style="color: #333333; margin: 0 0 10px 0; font-size: 22px;">
      Hola ${data.userName} 👋
    </h2>
    
    <p style="color: #555555; line-height: 1.6; margin: 0 0 20px 0;">
      Recibimos una solicitud para restablecer la contraseña de tu cuenta.
    </p>

    <div style="background: linear-gradient(135deg, #fff3e0 0%, #ffe0b2 100%); padding: 25px; border-radius: 8px; border-left: 4px solid #ff9800; margin: 25px 0;">
      <h3 style="color: #e65100; margin: 0 0 15px 0; font-size: 18px;">
        🔑 Restablecer contraseña
      </h3>
      <p style="color: #555555; margin: 0 0 15px 0; line-height: 1.6;">
        Haz clic en el botón de abajo para crear una nueva contraseña. Este enlace es válido por <strong>${data.expiresIn}</strong>.
      </p>
      
      <div style="text-align: center; margin: 20px 0;">
        <a href="${data.resetUrl}" 
           style="display: inline-block; background: linear-gradient(135deg, #ff9800 0%, #f57c00 100%); color: #ffffff; text-decoration: none; padding: 14px 40px; border-radius: 6px; font-weight: 600; font-size: 14px;">
          Restablecer mi contraseña
        </a>
      </div>

      <p style="color: #666666; font-size: 12px; margin: 15px 0 0 0; line-height: 1.4;">
        Si el botón no funciona, copia y pega este enlace en tu navegador:<br>
        <a href="${data.resetUrl}" style="color: #ff9800; word-break: break-all;">${data.resetUrl}</a>
      </p>
    </div>

    <div style="background-color: #ffebee; padding: 20px; border-radius: 8px; border-left: 4px solid #f44336; margin: 25px 0;">
      <p style="color: #c62828; margin: 0; line-height: 1.6;">
        <strong>⚠️ ¿No solicitaste este cambio?</strong><br>
        Si no pediste restablecer tu contraseña, ignora este email. Tu contraseña permanecerá sin cambios.
      </p>
    </div>

    <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 25px 0;">
      <h4 style="color: #333333; margin: 0 0 10px 0; font-size: 14px;">
        🛡️ Consejos de seguridad:
      </h4>
      <ul style="color: #555555; font-size: 13px; line-height: 1.6; margin: 0; padding-left: 20px;">
        <li>Usa una contraseña única y segura</li>
        <li>Nunca compartas tu contraseña con nadie</li>
        <li>Activa la autenticación de dos factores si está disponible</li>
      </ul>
    </div>

    <p style="color: #888888; font-size: 13px; line-height: 1.6; margin: 20px 0 0 0; text-align: center;">
      Si tienes problemas o preguntas, contacta con nuestro equipo de soporte.
    </p>
  `;

  return baseTemplate(content);
};

export const passwordResetSubject =
  '🔐 Solicitud de restablecimiento de contraseña';
