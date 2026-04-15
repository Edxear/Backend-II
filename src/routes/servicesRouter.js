import CustomRouter from '../utils/customRouter.js';
import config from '../config/config.js';
import { createLogger } from '../utils/loggerUtil.js';
import { AppError, ValidationError, NotFoundError } from '../middleware/errorHandler.js';
import emailService from '../services/emailService.js';

const logger = createLogger('ServicesRouter');
const custom = new CustomRouter();

// Validar que Twilio esté configurado
let twilioClient = null;
if (config.TWILIO_ACCOUNT_SID && config.TWILIO_AUTH_TOKEN) {
    const twilio = await import('twilio');
    twilioClient = twilio.default(config.TWILIO_ACCOUNT_SID, config.TWILIO_AUTH_TOKEN);
    logger.info('✅ Twilio disponible para envío de SMS');
} else {
    logger.warn('⚠️  Twilio no configurado - SMS deshabilitado');
}

/**
 * POST /api/services/sms
 * Envía un SMS usando Twilio
 * Body: { to, message }
 * Admin only
 */
custom.post('/sms', ['admin'], async (req, res) => {
    try {
        logger.start('Envío de SMS');

        if (!twilioClient) {
            throw new AppError('Twilio no está configurado', 503, 'SERVICE_UNAVAILABLE');
        }

        const { to, message } = req.body;

        if (!to || !message) {
            throw new ValidationError('Campos "to" y "message" son requeridos');
        }

        if (typeof message !== 'string' || message.trim().length === 0) {
            throw new ValidationError('El mensaje no puede estar vacío');
        }

        // Validar formato de teléfono (básico - debe empezar con +)
        if (!to.startsWith('+')) {
            throw new ValidationError('El número debe incluir código de país (ej: +543446595326)');
        }

        logger.debug('Enviando SMS', { to, message: message.substring(0, 50) });

        const result = await twilioClient.messages.create({
            body: message,
            from: config.TWILIO_SMS_NUMBER,
            to: to
        });

        logger.success('Envío de SMS completado', { 
            sid: result.sid, 
            to, 
            status: result.status 
        });

        res.sendSuccess({
            message: 'SMS enviado exitosamente',
            data: {
                sid: result.sid,
                to: result.to,
                status: result.status,
                sentAt: new Date().toISOString()
            }
        });
    } catch (error) {
        logger.fail('Envío de SMS', error);
        if (error instanceof ValidationError || error instanceof AppError) {
            throw error;
        }
        throw new AppError('Error enviando SMS: ' + error.message, 500, 'SMS_SEND_ERROR');
    }
});

/**
 * POST /api/services/email
 * Envía un email
 * Body: { to, subject, html }
 * Admin only
 */
custom.post('/email', ['admin'], async (req, res) => {
    try {
        logger.start('Envío de Email');

        if (!emailService.transporter) {
            throw new AppError('Email no está configurado', 503, 'SERVICE_UNAVAILABLE');
        }

        const { to, subject, html } = req.body;

        if (!to || !subject || !html) {
            throw new ValidationError('Campos "to", "subject" y "html" son requeridos');
        }

        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(to)) {
            throw new ValidationError('Email inválido');
        }

        logger.debug('Enviando email', { to, subject: subject.substring(0, 50) });

        const result = await emailService.sendMail({
            to,
            subject,
            html
        });

        logger.success('Email enviado', { 
            messageId: result.messageId, 
            to 
        });

        res.sendSuccess({
            message: 'Email enviado exitosamente',
            data: {
                to,
                subject,
                messageId: result.messageId,
                sentAt: new Date().toISOString()
            }
        });
    } catch (error) {
        logger.fail('Envío de Email', error);
        if (error instanceof ValidationError || error instanceof AppError) {
            throw error;
        }
        throw new AppError('Error enviando email: ' + error.message, 500, 'EMAIL_SEND_ERROR');
    }
});

/**
 * GET /api/services/health
 * Verifica el estado de los servicios externos
 * Public
 */
custom.get('/health', ['PUBLIC'], (req, res) => {
    const health = {
        status: 'ok',
        timestamp: new Date().toISOString(),
        services: {
            email: {
                available: !!emailService.transporter,
                configured: !!(config.EMAIL_USER && config.EMAIL_PASS)
            },
            sms: {
                available: !!twilioClient,
                configured: !!(config.TWILIO_ACCOUNT_SID && config.TWILIO_AUTH_TOKEN)
            }
        }
    };

    logger.debug('Health check solicitado', health);
    res.sendSuccess(health);
});

/**
 * POST /api/services/test-sms
 * Prueba el envío de SMS (para desarrollo)
 * Envía un SMS de prueba al número configurado
 * Admin only
 */
custom.post('/test-sms', ['admin'], async (req, res) => {
    try {
        logger.start('Test de SMS');

        if (!twilioClient) {
            throw new AppError('Twilio no está configurado', 503, 'SERVICE_UNAVAILABLE');
        }

        if (!config.TWILIO_SMS_NUMBER) {
            throw new AppError('Número de SMS de prueba no configurado', 400);
        }

        const testMessage = `Test SMS - ${new Date().toISOString()}`;
        
        const result = await twilioClient.messages.create({
            body: testMessage,
            from: config.TWILIO_SMS_NUMBER,
            to: config.TWILIO_SMS_NUMBER // Envía a sí mismo para testing
        });

        logger.success('Test de SMS completado', { sid: result.sid });

        res.sendSuccess({
            message: 'Test SMS enviado exitosamente',
            data: {
                sid: result.sid,
                message: testMessage,
                status: result.status
            }
        });
    } catch (error) {
        logger.fail('Test de SMS', error);
        if (error instanceof AppError) {
            throw error;
        }
        throw new AppError('Error en test de SMS: ' + error.message, 500);
    }
});

/**
 * POST /api/services/test-email
 * Prueba el envío de email
 * Envía un email de prueba a la dirección configurada
 * Admin only
 */
custom.post('/test-email', ['admin'], async (req, res) => {
    try {
        logger.start('Test de Email');

        if (!emailService.transporter) {
            throw new AppError('Email no está configurado', 503, 'SERVICE_UNAVAILABLE');
        }

        if (!config.EMAIL_USER) {
            throw new AppError('Email de prueba no configurado', 400);
        }

        const result = await emailService.sendMail({
            to: config.EMAIL_USER,
            subject: 'Test Email - Backend II',
            html: `
                <h1>🧪 Test de Email</h1>
                <p>Este es un email de prueba del sistema Backend II</p>
                <p><strong>Timestamp:</strong> ${new Date().toISOString()}</p>
                <p><strong>Ambiente:</strong> ${process.env.NODE_ENV || 'development'}</p>
            `
        });

        logger.success('Test de Email completado', { messageId: result.messageId });

        res.sendSuccess({
            message: 'Test email enviado exitosamente',
            data: {
                to: config.EMAIL_USER,
                messageId: result.messageId,
                subject: 'Test Email - Backend II'
            }
        });
    } catch (error) {
        logger.fail('Test de Email', error);
        if (error instanceof AppError) {
            throw error;
        }
        throw new AppError('Error en test de email: ' + error.message, 500);
    }
});

logger.info('✅ Router de servicios inicializado correctamente');

export default custom.getRouter();
