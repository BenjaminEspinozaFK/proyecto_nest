/**
 * Template para email de configuración de contraseña inicial
 */
export const passwordSetupSubject = '🔐 Configura tu contraseña - Sistema de Vales';

interface PasswordSetupTemplateParams {
  userName: string;
  userEmail: string;
  temporaryPassword: string;
}

export const passwordSetupTemplate = ({
  userName,
  userEmail,
  temporaryPassword,
}: PasswordSetupTemplateParams): string => {
  return `
    <!DOCTYPE html>
    <html lang="es">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Configura tu Contraseña</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);">
      <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="margin: 0; padding: 20px;">
        <tr>
          <td align="center">
            <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 40px rgba(0,0,0,0.2);">
              
              <!-- Header con gradiente -->
              <tr>
                <td style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 20px; text-align: center;">
                  <div style="background-color: rgba(255,255,255,0.2); width: 80px; height: 80px; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; margin-bottom: 20px;">
                    <span style="font-size: 40px;">🔐</span>
                  </div>
                  <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700;">
                    ¡Bienvenido al Sistema!
                  </h1>
                  <p style="margin: 10px 0 0 0; color: rgba(255,255,255,0.95); font-size: 16px;">
                    Configura tu contraseña para comenzar
                  </p>
                </td>
              </tr>

              <!-- Contenido -->
              <tr>
                <td style="padding: 40px 30px;">
                  <p style="margin: 0 0 20px 0; color: #333333; font-size: 16px; line-height: 1.6;">
                    Hola <strong style="color: #667eea;">${userName}</strong>,
                  </p>
                  
                  <p style="margin: 0 0 20px 0; color: #666666; font-size: 15px; line-height: 1.6;">
                    Tu cuenta ha sido creada exitosamente en el <strong>Sistema de Gestión de Vales de Gas</strong>. 
                    Para comenzar a utilizar el sistema, necesitas configurar tu contraseña personal.
                  </p>

                  <!-- Caja de información de usuario -->
                  <div style="background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%); border-radius: 12px; padding: 20px; margin: 25px 0;">
                    <p style="margin: 0 0 12px 0; color: #333; font-size: 14px; font-weight: 600;">
                      📧 Tu correo electrónico:
                    </p>
                    <p style="margin: 0 0 20px 0; color: #667eea; font-size: 16px; font-weight: 700;">
                      ${userEmail}
                    </p>
                    
                    <p style="margin: 0 0 12px 0; color: #333; font-size: 14px; font-weight: 600;">
                      🔑 Contraseña temporal:
                    </p>
                    <div style="background-color: #ffffff; border: 2px dashed #667eea; border-radius: 8px; padding: 15px; text-align: center;">
                      <code style="color: #764ba2; font-size: 20px; font-weight: 700; letter-spacing: 2px; font-family: 'Courier New', monospace;">
                        ${temporaryPassword}
                      </code>
                    </div>
                  </div>

                  <!-- Instrucciones -->
                  <div style="background-color: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 25px 0; border-radius: 4px;">
                    <p style="margin: 0 0 10px 0; color: #856404; font-size: 14px; font-weight: 600;">
                      ⚠️ Importante:
                    </p>
                    <ul style="margin: 0; padding-left: 20px; color: #856404; font-size: 13px; line-height: 1.6;">
                      <li>Esta contraseña es <strong>temporal</strong></li>
                      <li>Debes cambiarla en tu primer inicio de sesión</li>
                      <li>No compartas esta información con nadie</li>
                      <li>Si no solicitaste esta cuenta, ignora este mensaje</li>
                    </ul>
                  </div>

                  <!-- Pasos para iniciar sesión -->
                  <div style="margin: 30px 0;">
                    <h3 style="margin: 0 0 15px 0; color: #333; font-size: 18px; font-weight: 600;">
                      📝 Pasos para acceder:
                    </h3>
                    <ol style="margin: 0; padding-left: 20px; color: #666; font-size: 14px; line-height: 2;">
                      <li>Ingresa a la plataforma con tu correo electrónico</li>
                      <li>Usa la contraseña temporal proporcionada arriba</li>
                      <li>El sistema te pedirá crear una nueva contraseña</li>
                      <li>Elige una contraseña segura (mínimo 6 caracteres)</li>
                      <li>¡Listo! Ya puedes usar el sistema</li>
                    </ol>
                  </div>

                  <!-- Botón de acceso -->
                  <div style="text-align: center; margin: 35px 0;">
                    <a href="http://localhost:3000" 
                       style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #ffffff; text-decoration: none; padding: 16px 40px; border-radius: 30px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4); transition: transform 0.2s;">
                      🚀 Acceder al Sistema
                    </a>
                  </div>

                  <!-- Información de seguridad -->
                  <div style="background-color: #e8f5e9; border-left: 4px solid #4caf50; padding: 15px; margin: 25px 0; border-radius: 4px;">
                    <p style="margin: 0; color: #2e7d32; font-size: 13px; line-height: 1.6;">
                      🛡️ <strong>Seguridad:</strong> Este correo contiene información confidencial. 
                      Una vez que hayas configurado tu contraseña personal, elimina este mensaje de tu bandeja de entrada.
                    </p>
                  </div>
                </td>
              </tr>

              <!-- Footer -->
              <tr>
                <td style="background-color: #f8f9fa; padding: 30px; text-align: center; border-top: 1px solid #e9ecef;">
                  <p style="margin: 0 0 10px 0; color: #6c757d; font-size: 13px;">
                    Este es un correo automático del Sistema de Gestión de Vales de Gas
                  </p>
                  <p style="margin: 0; color: #adb5bd; font-size: 12px;">
                    Si tienes problemas para acceder, contacta al administrador del sistema
                  </p>
                  <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid #dee2e6;">
                    <p style="margin: 0; color: #adb5bd; font-size: 11px;">
                      © ${new Date().getFullYear()} Sistema de Vales de Gas. Todos los derechos reservados.
                    </p>
                  </div>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;
};
