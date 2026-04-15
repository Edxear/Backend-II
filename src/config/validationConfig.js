import { createLogger } from '../utils/loggerUtil.js';

const logger = createLogger('ConfigValidator');

/**
 * Valida las variables de entorno críticas
 */
export const validateConfig = (config) => {
    const errors = [];
    const warnings = [];

    // Validaciones críticas (deben existir)
    if (!config.PORT) {
        errors.push('PORT no está configurado');
    }
    if (!config.MONGODB_URI) {
        errors.push('MONGODB_URI no está configurado');
    }
    if (!config.DB_NAME) {
        errors.push('DB_NAME no está configurado');
    }
    if (!config.JWT_SECRET) {
        errors.push('JWT_SECRET no está configurado');
    }
    if (!config.SESSION_SECRET) {
        errors.push('SESSION_SECRET no está configurado');
    }
    if (!config.COOKIE_SECRET) {
        errors.push('COOKIE_SECRET no está configurado');
    }
    
    // En producción, validar que no sean valores por defecto
    if (config.isProduction && config.NODE_ENV === 'production') {
        if (config.JWT_SECRET && config.JWT_SECRET.includes('default')) {
            errors.push('JWT_SECRET usa valor por defecto en PRODUCCIÓN - CAMBIAR INMEDIATAMENTE');
        }
    }

    // Validaciones de advertencia (opcionales pero recomendadas)
    if (!config.EMAIL_USER || !config.EMAIL_PASS) {
        warnings.push('Email no configurado - funcionalidad de correo deshabilitada');
    }
    if (!config.TWILIO_ACCOUNT_SID || !config.TWILIO_AUTH_TOKEN) {
        warnings.push('Twilio no configurado - funcionalidad de SMS deshabilitada');
    }
    if (!config.GITHUB_CLIENT_ID || !config.GITHUB_CLIENT_SECRET) {
        warnings.push('GitHub OAuth no configurado - login con GitHub deshabilitado');
    }

    // Registrar warnings
    if (warnings.length > 0) {
        warnings.forEach(warning => {
            logger.warn(`⚠️  ${warning}`);
        });
    }

    // Si hay errores, fallar
    if (errors.length > 0) {
        logger.error('❌ Errores críticos de configuración detectados:');
        errors.forEach((error, index) => {
            logger.error(`  ${index + 1}. ${error}`);
        });
        throw new Error('Configuración inválida. Revisa las variables de entorno.');
    }

    logger.success('Validación de configuración completada');
    return { isValid: true, warnings };
};

/**
 * Valida que se pueda conectar a la base de datos
 */
export const validateDatabaseConnection = async (connDB, mongoUri, dbName) => {
    try {
        logger.start('Conexión a Base de Datos');
        await connDB(mongoUri, dbName);
        logger.success('Conexión a Base de Datos');
        return true;
    } catch (error) {
        logger.fail('Conexión a Base de Datos', error);
        throw error;
    }
};

/**
 * Valida configuración de servicios externos
 */
export const validateExternalServices = (config) => {
    const services = {
        email: {
            enabled: !!(config.EMAIL_USER && config.EMAIL_PASS),
            status: config.EMAIL_USER && config.EMAIL_PASS ? '✅ Configurado' : '⚠️  No configurado'
        },
        twilio: {
            enabled: !!(config.TWILIO_ACCOUNT_SID && config.TWILIO_AUTH_TOKEN),
            status: config.TWILIO_ACCOUNT_SID && config.TWILIO_AUTH_TOKEN ? '✅ Configurado' : '⚠️  No configurado'
        },
        github: {
            enabled: !!(config.GITHUB_CLIENT_ID && config.GITHUB_CLIENT_SECRET),
            status: config.GITHUB_CLIENT_ID && config.GITHUB_CLIENT_SECRET ? '✅ Configurado' : '⚠️  No configurado'
        }
    };

    logger.info('Estado de Servicios Externos:');
    Object.entries(services).forEach(([service, config]) => {
        logger.info(`  • ${service}: ${config.status}`);
    });

    return services;
};

/**
 * Valida que el puerto esté disponible
 */
export const validatePort = (port) => {
    if (!port || port < 1 || port > 65535) {
        throw new Error(`Puerto inválido: ${port}`);
    }
    logger.info(`✅ Puerto validado: ${port}`);
    return true;
};

/**
 * Validación completa al arrancar
 */
export const runStartupValidation = async (config, connDB) => {
    try {
        logger.start('Validación de Startup');

        // Validar configuración
        validateConfig(config);

        // Validar puerto
        validatePort(config.PORT);

        // Validar servicios externos
        validateExternalServices(config);

        // Validar conexión a BD
        await validateDatabaseConnection(connDB, config.MONGODB_URI, config.DB_NAME);

        logger.success('Validación de Startup completada');
        logger.info('🚀 Sistema listo para producción');

        return true;
    } catch (error) {
        logger.error('Fallos en validación de startup', error);
        process.exit(1);
    }
};
