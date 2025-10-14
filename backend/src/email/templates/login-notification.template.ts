import { baseTemplate } from './base.template';

interface LoginNotificationData {
  userName: string;
  userEmail: string;
  userRole: string;
  loginDate: string;
  ipAddress?: string;
  device?: string;
}

export const loginNotificationTemplate = (
  data: LoginNotificationData,
): string => {
  const content = `
    <h2 style="color: #333333; margin: 0 0 20px 0; font-size: 22px;">
      ¡Hola ${data.userName}! 👋
    </h2>
    
    <p style="color: #555555; line-height: 1.6; margin: 0 0 20px 0;">
      Se ha detectado un nuevo inicio de sesión en tu cuenta.
    </p>

    <!-- Info Box -->
    <div style="background: linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 100%); padding: 25px; border-radius: 8px; border-left: 4px solid #4caf50; margin: 20px 0;">
      <h3 style="color: #2e7d32; margin: 0 0 15px 0; font-size: 18px; display: flex; align-items: center;">
        <span style="margin-right: 8px;">✅</span> Inicio de sesión exitoso
      </h3>
      
      <table style="width: 100%; border-collapse: collapse;">
        <tr>
          <td style="padding: 8px 0; color: #333333; font-weight: 600; width: 35%;">
            📅 Fecha y hora:
          </td>
          <td style="padding: 8px 0; color: #555555;">
            ${data.loginDate}
          </td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #333333; font-weight: 600;">
            📧 Email:
          </td>
          <td style="padding: 8px 0; color: #555555;">
            ${data.userEmail}
          </td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #333333; font-weight: 600;">
            👤 Rol:
          </td>
          <td style="padding: 8px 0; color: #555555;">
            <span style="background-color: #fff3e0; color: #e65100; padding: 4px 12px; border-radius: 12px; font-size: 12px; font-weight: 600;">
              ${data.userRole.toUpperCase()}
            </span>
          </td>
        </tr>
        ${
          data.ipAddress
            ? `
        <tr>
          <td style="padding: 8px 0; color: #333333; font-weight: 600;">
            🌐 IP:
          </td>
          <td style="padding: 8px 0; color: #555555;">
            ${data.ipAddress}
          </td>
        </tr>
        `
            : ''
        }
        ${
          data.device
            ? `
        <tr>
          <td style="padding: 8px 0; color: #333333; font-weight: 600;">
            💻 Dispositivo:
          </td>
          <td style="padding: 8px 0; color: #555555;">
            ${data.device}
          </td>
        </tr>
        `
            : ''
        }
      </table>
    </div>

    <!-- Warning Box -->
    <div style="background-color: #fff3cd; padding: 20px; border-radius: 8px; border-left: 4px solid #ffc107; margin: 20px 0;">
      <p style="color: #856404; margin: 0; line-height: 1.6;">
        <strong>⚠️ ¿No fuiste tú?</strong><br>
        Si no reconoces este inicio de sesión, cambia tu contraseña inmediatamente y contacta con soporte.
      </p>
    </div>

    <!-- Action Button -->
    <div style="text-align: center; margin: 30px 0;">
      <a href="https://tu-app.com/security" 
         style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #ffffff; text-decoration: none; padding: 14px 40px; border-radius: 6px; font-weight: 600; font-size: 14px;">
        Ver actividad de la cuenta
      </a>
    </div>

    <p style="color: #888888; font-size: 13px; line-height: 1.6; margin: 20px 0 0 0; text-align: center;">
      Si tienes alguna pregunta, no dudes en contactarnos.
    </p>
  `;

  return baseTemplate(content);
};

export const loginNotificationSubject = '🔐 Nuevo inicio de sesión detectado';
