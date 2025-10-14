import { baseTemplate } from './base.template';

interface WelcomeData {
  userName: string;
  userEmail: string;
}

export const welcomeTemplate = (data: WelcomeData): string => {
  const content = `
    <h2 style="color: #333333; margin: 0 0 10px 0; font-size: 26px;">
      ¡Bienvenido/a a Tu Aplicación! 🎉
    </h2>
    
    <p style="color: #555555; line-height: 1.6; margin: 0 0 20px 0; font-size: 16px;">
      Hola <strong>${data.userName}</strong>, estamos emocionados de tenerte con nosotros.
    </p>

    <div style="background: linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%); padding: 25px; border-radius: 8px; border-left: 4px solid #2196f3; margin: 25px 0;">
      <h3 style="color: #1565c0; margin: 0 0 15px 0; font-size: 18px;">
        📋 Datos de tu cuenta
      </h3>
      <p style="color: #333333; margin: 5px 0;">
        <strong>Email:</strong> ${data.userEmail}
      </p>
      <p style="color: #666666; margin: 15px 0 0 0; font-size: 14px;">
        Ya puedes comenzar a usar todas las funcionalidades de la plataforma.
      </p>
    </div>

    <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 25px 0;">
      <h3 style="color: #333333; margin: 0 0 15px 0; font-size: 16px;">
        🚀 Primeros pasos
      </h3>
      <ul style="color: #555555; line-height: 1.8; margin: 0; padding-left: 20px;">
        <li>Completa tu perfil</li>
        <li>Configura tus preferencias</li>
        <li>Explora las funcionalidades</li>
        <li>Únete a nuestra comunidad</li>
      </ul>
    </div>

    <div style="text-align: center; margin: 30px 0;">
      <a href="https://tu-app.com/dashboard" 
         style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #ffffff; text-decoration: none; padding: 14px 40px; border-radius: 6px; font-weight: 600; font-size: 14px;">
        Ir a mi cuenta
      </a>
    </div>

    <p style="color: #888888; font-size: 14px; line-height: 1.6; margin: 20px 0 0 0; text-align: center;">
      Si necesitas ayuda, nuestro equipo está aquí para ti. 💙
    </p>
  `;

  return baseTemplate(content);
};

export const welcomeSubject =
  '¡Bienvenido/a! Tu cuenta ha sido creada exitosamente';
