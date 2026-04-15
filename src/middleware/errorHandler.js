import { createLogger } from '../utils/loggerUtil.js';

const logger = createLogger('ErrorHandler');

/**
 * Middleware de captura de errores centralizado
 * Debe ser el ÚLTIMO middleware registrado en app.js
 */
export const errorHandler = (err, req, res, next) => {
    const requestId = req.id || Math.random().toString(36).substr(2, 9);
    const method = req.method;
    const path = req.originalUrl;

    // Log del error
    logger.error(`${method} ${path}`, {
        requestId,
        statusCode: err.statusCode || 500,
        message: err.message,
        stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });

    // Determinar código de status
    const statusCode = err.statusCode || err.status || 500;

    // Respuesta estandarizada
    const response = {
        status: 'error',
        error: {
            code: err.code || 'INTERNAL_ERROR',
            message: err.message || 'Error interno del servidor',
            requestId
        }
    };

    // Agregar detalles en desarrollo
    if (process.env.NODE_ENV === 'development') {
        response.error.stack = err.stack;
        response.error.details = err.details || null;
    }

    res.status(statusCode).json(response);
};

/**
 * Middleware para capturar errores async en routes
 */
export const asyncHandler = (fn) => {
    return (req, res, next) => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
};

/**
 * Middleware para rutas no encontradas (404)
 */
export const notFoundHandler = (req, res, next) => {
    const error = new Error(`Ruta no encontrada: ${req.originalUrl}`);
    error.statusCode = 404;
    next(error);
};

/**
 * Clase para crear errores personalizados
 */
export class AppError extends Error {
    constructor(message, statusCode = 500, code = 'ERROR', details = null) {
        super(message);
        this.statusCode = statusCode;
        this.code = code;
        this.details = details;
        this.timestamp = new Date().toISOString();

        // Capturar stack trace
        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, this.constructor);
        }
    }
}

/**
 * Errores de validación
 */
export class ValidationError extends AppError {
    constructor(message, details = null) {
        super(message, 400, 'VALIDATION_ERROR', details);
        this.name = 'ValidationError';
    }
}

/**
 * Errores de autenticación
 */
export class AuthenticationError extends AppError {
    constructor(message = 'No autenticado') {
        super(message, 401, 'AUTHENTICATION_ERROR');
        this.name = 'AuthenticationError';
    }
}

/**
 * Errores de autorización
 */
export class AuthorizationError extends AppError {
    constructor(message = 'No autorizado') {
        super(message, 403, 'AUTHORIZATION_ERROR');
        this.name = 'AuthorizationError';
    }
}

/**
 * Errores de recurso no encontrado
 */
export class NotFoundError extends AppError {
    constructor(resource = 'Recurso', details = null) {
        super(`${resource} no encontrado`, 404, 'NOT_FOUND', details);
        this.name = 'NotFoundError';
    }
}

/**
 * Errores de conflicto (ej: email duplicado)
 */
export class ConflictError extends AppError {
    constructor(message, details = null) {
        super(message, 409, 'CONFLICT', details);
        this.name = 'ConflictError';
    }
}

/**
 * Errores de servidor interno
 */
export class InternalServerError extends AppError {
    constructor(message = 'Error interno del servidor', details = null) {
        super(message, 500, 'INTERNAL_SERVER_ERROR', details);
        this.name = 'InternalServerError';
    }
}

/**
 * Validador de entrada que lanza ValidationError
 */
export const validateInput = (data, schema) => {
    if (!data) {
        throw new ValidationError('Los datos son requeridos', { received: typeof data });
    }

    if (schema && typeof schema === 'object' && Array.isArray(schema.required)) {
        const missing = schema.required.filter(field => !data[field]);
        if (missing.length > 0) {
            throw new ValidationError('Campos requeridos faltantes', { missing });
        }
    }

    return data;
};

/**
 * Handler seguro para delete operations
 */
export const handleDeleteOperation = (deletedCount, resourceName) => {
    if (deletedCount === 0) {
        throw new NotFoundError(resourceName);
    }
    return true;
};

export default errorHandler;
