import { baseTemplate } from './base.template';

interface EmailVerificationData {
  userName: string;
  verificationUrl: string;
  expiresIn: string;
}

export const emailVerificationTemplate = (
  data: EmailVerificationData,
): string => {
  const content = `
    <h2 style="color: #333333; margin: 0 0 10px 0; font-size: 26px;">
      Verifica tu correo electrónico
    </h2>
    
    <p style="color: #555555; line-height: 1.6; margin: 0 0 20px 0; font-size: 16px;">
      Hola <strong>${data.userName}</strong>, gracias por registrarte. Para activar tu cuenta necesitas verificar tu correo electrónico.
    </p>

    <div style="text-align: center; margin: 30px 0;">
      <a href="${data.verificationUrl}" 
         style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #ffffff; text-decoration: none; padding: 14px 40px; border-radius: 6px; font-weight: 600; font-size: 16px;">
        Verificar mi correo
      </a>
    </div>

    <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 25px 0;">
      <p style="color: #555555; margin: 0; font-size: 14px; line-height: 1.6;">
        Si el botón no funciona, copia y pega este enlace en tu navegador:
      </p>
      <p style="color: #667eea; word-break: break-all; margin: 10px 0 0 0; font-size: 13px;">
        ${data.verificationUrl}
      </p>
    </div>

    <p style="color: #888888; font-size: 14px; line-height: 1.6; margin: 20px 0 0 0;">
      Este enlace expira en <strong>${data.expiresIn}</strong>. Si no creaste esta cuenta, puedes ignorar este mensaje.
    </p>
  `;

  return baseTemplate(content);
};

export const emailVerificationSubject = 'Verifica tu correo electrónico';
