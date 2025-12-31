const nodemailer = require('nodemailer');

// Configurar el transportador de correo
const createTransporter = () => {
    // Si estás en desarrollo, puedes usar un servicio de prueba como Ethereal
    // En producción, usa tu servicio de email real (Gmail, SendGrid, etc.)

    if (process.env.NODE_ENV === 'production' && process.env.EMAIL_SERVICE) {
        // Configuración para servicios reales
        return nodemailer.createTransport({
            service: process.env.EMAIL_SERVICE, // 'gmail', 'outlook', etc.
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASSWORD
            }
        });
    } else {
        // Configuración para desarrollo (usa Ethereal o SMTP personalizado)
        return nodemailer.createTransport({
            host: process.env.SMTP_HOST || 'smtp.ethereal.email',
            port: process.env.SMTP_PORT || 587,
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS
            }
        });
    }
};

const sendPasswordResetEmail = async (email, resetToken) => {
    const transporter = createTransporter();

    const resetUrl = `${process.env.FRONTEND_URL}/restablecer-contraseña/${resetToken}`;

    const mailOptions = {
        from: `"Eguva" <${process.env.EMAIL_FROM || 'noreply@eguva.com'}>`,
        to: email,
        subject: 'Recuperación de Contraseña - Eguva',
        html: `
            <!DOCTYPE html>
            <html lang="es">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <link href="https://fonts.googleapis.com/css2?family=Oswald:wght@400;700&family=Inter:wght@400;500;600&display=swap" rel="stylesheet">
                <style>
                    * {
                        margin: 0;
                        padding: 0;
                        box-sizing: border-box;
                    }
                    body {
                        font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
                        line-height: 1.6;
                        color: #374151;
                        background-color: #F5F5F5;
                        padding: 40px 20px;
                    }
                    .wrapper {
                        max-width: 500px;
                        margin: 0 auto;
                    }
                    .card {
                        background: #FFFFFF;
                        border-radius: 16px;
                        box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.1);
                        overflow: hidden;
                        border: 1px solid #E5E7EB;
                    }
                    .header {
                        background: #1a1a1a;
                        padding: 32px;
                        text-align: center;
                    }
                    .logo {
                        font-family: 'Oswald', sans-serif;
                        font-size: 32px;
                        font-weight: 700;
                        color: #FFFFFF;
                        text-transform: uppercase;
                        letter-spacing: 4px;
                        margin: 0;
                    }
                    .content {
                        padding: 40px 32px;
                    }
                    .icon-container {
                        width: 64px;
                        height: 64px;
                        background: #F5F5F5;
                        border-radius: 50%;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        margin: 0 auto 24px;
                    }
                    .icon {
                        font-size: 28px;
                    }
                    h2 {
                        font-family: 'Oswald', sans-serif;
                        font-size: 24px;
                        font-weight: 700;
                        color: #1a1a1a;
                        text-align: center;
                        margin-bottom: 12px;
                        text-transform: uppercase;
                        letter-spacing: 1px;
                    }
                    .subtitle {
                        color: #6B7280;
                        text-align: center;
                        font-size: 14px;
                        margin-bottom: 32px;
                    }
                    .message {
                        color: #4B5563;
                        font-size: 15px;
                        margin-bottom: 24px;
                    }
                    .button-container {
                        text-align: center;
                        margin: 32px 0;
                    }
                    .button {
                        display: inline-block;
                        padding: 16px 40px;
                        background: #1a1a1a;
                        color: #FFFFFF !important;
                        text-decoration: none;
                        font-family: 'Oswald', sans-serif;
                        font-weight: 700;
                        font-size: 14px;
                        text-transform: uppercase;
                        letter-spacing: 2px;
                        border-radius: 2px;
                        transition: all 0.3s ease;
                    }
                    .button:hover {
                        background: #2d2d2d;
                        box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
                    }
                    .link-box {
                        background: #F9FAFB;
                        border: 1px solid #E5E7EB;
                        border-radius: 8px;
                        padding: 16px;
                        margin: 24px 0;
                    }
                    .link-label {
                        font-size: 12px;
                        color: #9CA3AF;
                        text-transform: uppercase;
                        letter-spacing: 0.5px;
                        margin-bottom: 8px;
                    }
                    .link-url {
                        font-size: 13px;
                        color: #1a1a1a;
                        word-break: break-all;
                        font-family: monospace;
                    }
                    .warning {
                        background: #FEF3C7;
                        border-left: 3px solid #F59E0B;
                        padding: 16px;
                        border-radius: 0 8px 8px 0;
                        margin: 24px 0;
                        display: flex;
                        align-items: flex-start;
                        gap: 12px;
                    }
                    .warning-icon {
                        font-size: 18px;
                    }
                    .warning-text {
                        font-size: 13px;
                        color: #92400E;
                    }
                    .warning-text strong {
                        color: #78350F;
                    }
                    .divider {
                        height: 1px;
                        background: #E5E7EB;
                        margin: 32px 0;
                    }
                    .help-text {
                        font-size: 13px;
                        color: #9CA3AF;
                        text-align: center;
                    }
                    .footer {
                        background: #F9FAFB;
                        padding: 24px 32px;
                        text-align: center;
                        border-top: 1px solid #E5E7EB;
                    }
                    .footer-text {
                        font-size: 12px;
                        color: #9CA3AF;
                        margin-bottom: 8px;
                    }
                    .footer-brand {
                        font-family: 'Oswald', sans-serif;
                        font-size: 14px;
                        font-weight: 700;
                        color: #1a1a1a;
                        text-transform: uppercase;
                        letter-spacing: 2px;
                    }
                    .social-links {
                        margin-top: 16px;
                    }
                    .social-link {
                        display: inline-block;
                        margin: 0 8px;
                        color: #9CA3AF;
                        text-decoration: none;
                        font-size: 12px;
                    }
                    .social-link:hover {
                        color: #1a1a1a;
                    }
                </style>
            </head>
            <body>
                <div class="wrapper">
                    <div class="card">
                        <!-- Header -->
                        <div class="header">
                            <h1 class="logo">Eguva</h1>
                        </div>
                        
                        <!-- Content -->
                        <div class="content">
                            <div class="icon-container">
                                <span class="icon">🔐</span>
                            </div>
                            
                            <h2>Recupera tu Contraseña</h2>
                            <p class="subtitle">No te preocupes, te ayudaremos a recuperar el acceso</p>
                            
                            <p class="message">
                                Hola,<br><br>
                                Recibimos una solicitud para restablecer la contraseña de tu cuenta en <strong>Eguva</strong>. 
                                Si fuiste tú, haz clic en el botón de abajo para crear una nueva contraseña.
                            </p>
                            
                            <div class="button-container">
                                <a href="${resetUrl}" class="button">Restablecer Contraseña</a>
                            </div>
                            
                            <div class="link-box">
                                <p class="link-label">O copia este enlace:</p>
                                <p class="link-url">${resetUrl}</p>
                            </div>
                            
                            <div class="warning">
                                <span class="warning-icon">⏱️</span>
                                <p class="warning-text">
                                    Este enlace expirará en <strong>1 hora</strong> por razones de seguridad.
                                </p>
                            </div>
                            
                            <div class="divider"></div>
                            
                            <p class="help-text">
                                Si no solicitaste este cambio, puedes ignorar este correo de forma segura. 
                                Tu contraseña permanecerá igual.
                            </p>
                        </div>
                        
                        <!-- Footer -->
                        <div class="footer">
                            <p class="footer-text">Este es un correo automático, por favor no respondas.</p>
                            <p class="footer-brand">Eguva</p>
                            <p class="footer-text" style="margin-top: 8px;">Moda Sostenible & Urbana</p>
                            <div class="social-links">
                                <a href="https://wa.me/51994845979" class="social-link">WhatsApp</a>
                                <span style="color: #D1D5DB;">•</span>
                                <a href="#" class="social-link">Instagram</a>
                                <span style="color: #D1D5DB;">•</span>
                                <a href="#" class="social-link">Facebook</a>
                            </div>
                            <p class="footer-text" style="margin-top: 16px;">
                                © ${new Date().getFullYear()} Eguva. Todos los derechos reservados.
                            </p>
                        </div>
                    </div>
                </div>
            </body>
            </html>
        `
    };

    try {
        const info = await transporter.sendMail(mailOptions);
        console.log('Email enviado:', info.messageId);

        // En desarrollo, mostrar la URL de preview de Ethereal
        if (process.env.NODE_ENV !== 'production') {
            console.log('Preview URL:', nodemailer.getTestMessageUrl(info));
        }

        return info;
    } catch (error) {
        console.error('Error al enviar email:', error);
        throw new Error('No se pudo enviar el correo de recuperación');
    }
};

const sendNewsletterWelcomeEmail = async (email) => {
    const transporter = createTransporter();

    const mailOptions = {
        from: `"Eguva" <${process.env.EMAIL_FROM || 'noreply@eguva.com'}>`,
        to: email,
        subject: '¡Bienvenido a la comunidad Eguva! 🌿',
        html: `
            <!DOCTYPE html>
            <html lang="es">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <link href="https://fonts.googleapis.com/css2?family=Oswald:wght@400;700&family=Inter:wght@400;500;600&display=swap" rel="stylesheet">
                <style>
                    * { margin: 0; padding: 0; box-sizing: border-box; }
                    body { font-family: 'Inter', sans-serif; line-height: 1.6; color: #374151; background-color: #F5F5F5; padding: 40px 20px; }
                    .wrapper { max-width: 500px; margin: 0 auto; }
                    .card { background: #FFFFFF; border-radius: 16px; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.1); overflow: hidden; border: 1px solid #E5E7EB; }
                    .header { background: #1a1a1a; padding: 32px; text-align: center; }
                    .logo { font-family: 'Oswald', sans-serif; font-size: 32px; font-weight: 700; color: #FFFFFF; text-transform: uppercase; letter-spacing: 4px; margin: 0; }
                    .content { padding: 40px 32px; text-align: center; }
                    .icon-container { width: 64px; height: 64px; background: #F5F5F5; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 24px; }
                    .icon { font-size: 28px; }
                    h2 { font-family: 'Oswald', sans-serif; font-size: 24px; font-weight: 700; color: #1a1a1a; margin-bottom: 12px; text-transform: uppercase; letter-spacing: 1px; }
                    .message { color: #4B5563; font-size: 15px; margin-bottom: 24px; }
                    .divider { height: 1px; background: #E5E7EB; margin: 32px 0; }
                    .footer { background: #F9FAFB; padding: 24px 32px; text-align: center; border-top: 1px solid #E5E7EB; }
                    .footer-brand { font-family: 'Oswald', sans-serif; font-size: 14px; font-weight: 700; color: #1a1a1a; text-transform: uppercase; letter-spacing: 2px; }
                    .footer-text { font-size: 12px; color: #9CA3AF; margin-top: 8px; }
                </style>
            </head>
            <body>
                <div class="wrapper">
                    <div class="card">
                        <div class="header"><h1 class="logo">Eguva</h1></div>
                        <div class="content">
                            <div class="icon-container"><span class="icon">🌿</span></div>
                            <h2>¡Ya eres parte de la comunidad!</h2>
                            <p class="message">
                                Hola,<br><br>
                                ¡Gracias por suscribirte a nuestro boletín! A partir de ahora serás el primero en enterarte de nuestras nuevas colecciones, ofertas exclusivas y eventos especiales.
                            </p>
                            <div class="divider"></div>
                            <p style="font-size: 13px; color: #6B7280;">
                                Prepárate para lo mejor de la moda urbana y sostenible.
                            </p>
                        </div>
                        <div class="footer">
                            <p class="footer-brand">Eguva</p>
                            <p class="footer-text">Moda con Propósito</p>
                            <p class="footer-text">© ${new Date().getFullYear()} Eguva. Todos los derechos reservados.</p>
                        </div>
                    </div>
                </div>
            </body>
            </html>
        `
    };

    try {
        const info = await transporter.sendMail(mailOptions);
        if (process.env.NODE_ENV !== 'production') {
            console.log('Preview URL Welcome:', nodemailer.getTestMessageUrl(info));
        }
        return info;
    } catch (error) {
        console.error('Error al enviar email de bienvenida:', error);
        // No lanzamos error para no bloquear la suscripción si falla el email
    }
};

module.exports = {
    sendPasswordResetEmail,
    sendNewsletterWelcomeEmail
};
