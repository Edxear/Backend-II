import nodemailer from 'nodemailer';
import config from '../config/config.js';

class EmailService {
    constructor() {
        this.transporter = null;
        this.initializeTransporter();
    }

    initializeTransporter() {
        try {
            // Validar que las credenciales están configuradas
            if (!config.EMAIL_USER || !config.EMAIL_PASS) {
                console.warn('⚠️  EMAIL_USER y EMAIL_PASS no están configurados. Los correos no se enviarán.');
                return;
            }

            this.transporter = nodemailer.createTransport({
                service: config.EMAIL_SERVICE,
                auth: {
                    user: config.EMAIL_USER,
                    pass: config.EMAIL_PASS
                }
            });

            // Verificar conexión
            this.transporter.verify((error, success) => {
                if (error) {
                    console.error('❌ Error en configuración de email:', error);
                } else {
                    console.log('✅ Servidor de email conectado correctamente');
                }
            });
        } catch (error) {
            console.error('Error inicializando transporter:', error);
        }
    }

    /**
     * Método genérico para enviar correos
     */
    async sendMail(mailOptions) {
        if (!this.transporter) {
            console.warn('⚠️  Transporter no está inicializado. Configure EMAIL_USER y EMAIL_PASS en .env');
            return null;
        }

        try {
            const defaultOptions = {
                from: config.EMAIL_USER,
            };

            const options = { ...defaultOptions, ...mailOptions };
            const result = await this.transporter.sendMail(options);
            console.log('✅ Correo enviado:', result.messageId);
            return result;
        } catch (error) {
            console.error('❌ Error al enviar correo:', error);
            throw error;
        }
    }

    /**
     * Enviar correo de bienvenida tras registro
     */
    async sendWelcomeEmail(user) {
        const mailOptions = {
            to: user.email,
            subject: '¡Bienvenido a nuestro e-commerce!',
            html: `
                <!DOCTYPE html>
                <html lang="es">
                <head>
                    <meta charset="UTF-8">
                    <style>
                        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                        .container { max-width: 600px; margin: 0 auto; padding: 20px; background: #f9f9f9; border-radius: 8px; }
                        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
                        .content { padding: 20px; background: white; }
                        .button { display: inline-block; padding: 12px 30px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
                        .footer { text-align: center; font-size: 12px; color: #666; margin-top: 20px; padding-top: 20px; border-top: 1px solid #ddd; }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            <h1>¡Bienvenido ${user.first_name}!</h1>
                        </div>
                        <div class="content">
                            <p>Hola ${user.first_name} ${user.last_name},</p>
                            <p>Gracias por registrarte en nuestro e-commerce. Estamos emocionados de tenerte como parte de nuestra comunidad.</p>
                            <p>Tu cuenta ha sido creada exitosamente con el email: <strong>${user.email}</strong></p>
                            <p>Ahora puedes iniciar sesión y comenzar a explorar nuestros productos.</p>
                            <a href="http://localhost:${config.PORT}/login" class="button">Ir a Login</a>
                            <p>Si tienes alguna pregunta, no dudes en contactarnos.</p>
                        </div>
                        <div class="footer">
                            <p>&copy; 2026 E-commerce. Todos los derechos reservados.</p>
                        </div>
                    </div>
                </body>
                </html>
            `
        };

        return await this.sendMail(mailOptions);
    }

    /**
     * Enviar correo de recuperación de contraseña
     */
    async sendPasswordResetEmail(email, resetToken) {
        const resetUrl = `http://localhost:${config.PORT}/api/sessions/reset-password/${resetToken}`;

        const mailOptions = {
            to: email,
            subject: 'Recupera tu contraseña',
            html: `
                <!DOCTYPE html>
                <html lang="es">
                <head>
                    <meta charset="UTF-8">
                    <style>
                        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                        .container { max-width: 600px; margin: 0 auto; padding: 20px; background: #f9f9f9; border-radius: 8px; }
                        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
                        .content { padding: 20px; background: white; }
                        .button { display: inline-block; padding: 12px 30px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
                        .warning { background: #fff3cd; border-left: 4px solid #ffc107; padding: 10px; margin: 15px 0; }
                        .footer { text-align: center; font-size: 12px; color: #666; margin-top: 20px; padding-top: 20px; border-top: 1px solid #ddd; }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            <h1>Recupera tu Contraseña</h1>
                        </div>
                        <div class="content">
                            <p>Hola,</p>
                            <p>Recibimos una solicitud para recuperar tu contraseña. Haz clic en el botón de abajo para restablecer tu contraseña.</p>
                            <a href="${resetUrl}" class="button">Restaurar Contraseña</a>
                            <div class="warning">
                                <strong>⚠️ Importante:</strong> Este enlace expirará en <strong>1 hora</strong>. Si no lo usas en ese tiempo, deberás solicitar uno nuevo.
                            </div>
                            <p>Si no solicitaste esta recuperación, puedes ignorar este correo de forma segura.</p>
                            <p><strong>Por seguridad:</strong> Nunca compartiremos tu contraseña por correo.</p>
                        </div>
                        <div class="footer">
                            <p>&copy; 2026 E-commerce Final Backend II. Todos los derechos reservados.</p>
                        </div>
                    </div>
                </body>
                </html>
            `
        };

        return await this.sendMail(mailOptions);
    }

    /**
     * Enviar confirmación de compra exitosa
     */
    async sendPurchaseConfirmation(user, ticket) {
        const mailOptions = {
            to: user.email,
            subject: `Compra Confirmada - Ticket #${ticket.code}`,
            html: `
                <!DOCTYPE html>
                <html lang="es">
                <head>
                    <meta charset="UTF-8">
                    <style>
                        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                        .container { max-width: 600px; margin: 0 auto; padding: 20px; background: #f9f9f9; border-radius: 8px; }
                        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
                        .content { padding: 20px; background: white; }
                        .ticket-box { background: #f0f0f0; padding: 15px; border-left: 4px solid #28a745; margin: 15px 0; border-radius: 5px; }
                        .products { margin: 20px 0; }
                        .product-item { display: flex; justify-content: space-between; padding: 10px; border-bottom: 1px solid #eee; }
                        .product-item:last-child { border-bottom: none; }
                        .total { font-size: 18px; font-weight: bold; color: #28a745; text-align: right; padding: 15px 10px; }
                        .button { display: inline-block; padding: 12px 30px; background: #267eea; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
                        .footer { text-align: center; font-size: 12px; color: #666; margin-top: 20px; padding-top: 20px; border-top: 1px solid #ddd; }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            <h1>✅ ¡Compra Confirmada!</h1>
                        </div>
                        <div class="content">
                            <p>Hola ${user.first_name},</p>
                            <p>Gracias por tu compra. Tu pedido ha sido procesado exitosamente.</p>
                            
                            <div class="ticket-box">
                                <strong>📦 Número de Ticket:</strong> ${ticket.code}<br>
                                <strong>📅 Fecha:</strong> ${new Date(ticket.purchase_datetime).toLocaleString('es-ES')}<br>
                                <strong>💰 Total:</strong> $${ticket.amount.toFixed(2)}
                            </div>

                            <h3>Productos Comprados:</h3>
                            <div class="products">
                                ${ticket.products.map(p => `
                                    <div class="product-item">
                                        <span>${p.product?.title || 'Producto'} x ${p.quantity}</span>
                                        <span>$${(p.price * p.quantity).toFixed(2)}</span>
                                    </div>
                                `).join('')}
                            </div>
                            <div class="total">
                                Total: $${ticket.amount.toFixed(2)}
                            </div>

                            <p>Tu compra será procesada y despachada en las próximas 24-48 horas.</p>
                            <a href="http://localhost:${config.PORT}/products" class="button">Seguir Comprando</a>
                        </div>
                        <div class="footer">
                            <p>&copy; 2026 E-commerce Final Backend II. Todos los derechos reservados.</p>
                        </div>
                    </div>
                </body>
                </html>
            `
        };

        return await this.sendMail(mailOptions);
    }

    /**
     * Enviar notificación de compra incompleta
     */
    async sendPartialPurchaseNotification(user, ticket, failedProducts) {
        const mailOptions = {
            to: user.email,
            subject: `Compra Parcial - Ticket #${ticket.code}`,
            html: `
                <!DOCTYPE html>
                <html lang="es">
                <head>
                    <meta charset="UTF-8">
                    <style>
                        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                        .container { max-width: 600px; margin: 0 auto; padding: 20px; background: #f9f9f9; border-radius: 8px; }
                        .header { background: linear-gradient(135deg, #ffc107 0%, #ff9800 100%); color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
                        .content { padding: 20px; background: white; }
                        .warning { background: #fff3cd; border-left: 4px solid #ffc107; padding: 10px; margin: 15px 0; }
                        .ticket-box { background: #f0f0f0; padding: 15px; border-left: 4px solid #ffc107; margin: 15px 0; border-radius: 5px; }
                        .button { display: inline-block; padding: 12px 30px; background: #267eea; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
                        .footer { text-align: center; font-size: 12px; color: #666; margin-top: 20px; padding-top: 20px; border-top: 1px solid #ddd; }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            <h1>⚠️ Compra Parcial</h1>
                        </div>
                        <div class="content">
                            <p>Hola ${user.first_name},</p>
                            <p>Tu compra ha sido procesada parcialmente debido a problemas de stock.</p>
                            
                            <div class="ticket-box">
                                <strong>📦 Número de Ticket:</strong> ${ticket.code}<br>
                                <strong>📅 Fecha:</strong> ${new Date(ticket.purchase_datetime).toLocaleString('es-ES')}<br>
                                <strong>💰 Total Pagado:</strong> $${ticket.amount.toFixed(2)}
                            </div>

                            <div class="warning">
                                <strong>⚠️ Nota:</strong> Los siguientes productos no pudieron ser comprados por falta de stock y permanecerán en tu carrito:
                            </div>

                            <ul>
                                ${failedProducts.map(p => `<li>${p}</li>`).join('')}
                            </ul>

                            <p>Intenta completar la compra cuando estos productos estén disponibles nuevamente.</p>
                            <a href="http://localhost:${config.PORT}/products" class="button">Volver a la Tienda</a>
                        </div>
                        <div class="footer">
                            <p>&copy; 2026 E-commerce Final Backend II. Todos los derechos reservados.</p>
                        </div>
                    </div>
                </body>
                </html>
            `
        };

        return await this.sendMail(mailOptions);
    }

    /**
     * Enviar correo de contacto/newsletter
     */
    async sendNewsletterEmail(email, subject, content) {
        const mailOptions = {
            to: email,
            subject: subject,
            html: `
                <!DOCTYPE html>
                <html lang="es">
                <head>
                    <meta charset="UTF-8">
                    <style>
                        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                        .container { max-width: 600px; margin: 0 auto; padding: 20px; background: #f9f9f9; border-radius: 8px; }
                        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
                        .content { padding: 20px; background: white; }
                        .footer { text-align: center; font-size: 12px; color: #666; margin-top: 20px; padding-top: 20px; border-top: 1px solid #ddd; }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            <h1>${subject}</h1>
                        </div>
                        <div class="content">
                            ${content}
                        </div>
                        <div class="footer">
                            <p>&copy; 2026 E-commerce Final Backend II. Todos los derechos reservados.</p>
                        </div>
                    </div>
                </body>
                </html>
            `
        };

        return await this.sendMail(mailOptions);
    }
}

export default new EmailService();