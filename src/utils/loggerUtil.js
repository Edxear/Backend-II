import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const logsDir = path.join(__dirname, '../../logs');

// Crear directorio de logs si no existe
if (!fs.existsSync(logsDir)) {
    fs.mkdirSync(logsDir, { recursive: true });
}

const LOG_LEVELS = {
    ERROR: 'ERROR',
    WARN: 'WARN',
    INFO: 'INFO',
    DEBUG: 'DEBUG'
};

const LOG_COLORS = {
    ERROR: '\x1b[31m',    // Rojo
    WARN: '\x1b[33m',     // Amarillo
    INFO: '\x1b[36m',     // Cyan
    DEBUG: '\x1b[35m',    // Magenta
    RESET: '\x1b[0m'
};

class Logger {
    constructor(module = 'App') {
        this.module = module;
        this.logFile = path.join(logsDir, `app-${new Date().toISOString().split('T')[0]}.log`);
    }

    /**
     * Formatea el mensaje con timestamp y contexto
     */
    _formatMessage(level, message, data = null) {
        const timestamp = new Date().toISOString();
        const dataStr = data ? ` | ${JSON.stringify(data)}` : '';
        return `[${timestamp}] [${level}] [${this.module}] ${message}${dataStr}`;
    }

    /**
     * Escribe en archivo de log
     */
    _writeToFile(formattedMessage) {
        try {
            fs.appendFileSync(this.logFile, formattedMessage + '\n', 'utf8');
        } catch (error) {
            console.error('Error escribiendo en archivo de log:', error.message);
        }
    }

    /**
     * Log de ERROR
     */
    error(message, data = null) {
        const formatted = this._formatMessage(LOG_LEVELS.ERROR, message, data);
        console.error(`${LOG_COLORS.ERROR}${formatted}${LOG_COLORS.RESET}`);
        this._writeToFile(formatted);
    }

    /**
     * Log de WARNING
     */
    warn(message, data = null) {
        const formatted = this._formatMessage(LOG_LEVELS.WARN, message, data);
        console.warn(`${LOG_COLORS.WARN}${formatted}${LOG_COLORS.RESET}`);
        this._writeToFile(formatted);
    }

    /**
     * Log de INFO
     */
    info(message, data = null) {
        const formatted = this._formatMessage(LOG_LEVELS.INFO, message, data);
        console.log(`${LOG_COLORS.INFO}${formatted}${LOG_COLORS.RESET}`);
        this._writeToFile(formatted);
    }

    /**
     * Log de DEBUG (solo en development)
     */
    debug(message, data = null) {
        if (process.env.NODE_ENV === 'development') {
            const formatted = this._formatMessage(LOG_LEVELS.DEBUG, message, data);
            console.log(`${LOG_COLORS.DEBUG}${formatted}${LOG_COLORS.RESET}`);
            this._writeToFile(formatted);
        }
    }

    /**
     * Log de inicio de operación
     */
    start(operationName) {
        this.info(`▶️  Iniciando: ${operationName}`);
    }

    /**
     * Log de finalización exitosa
     */
    success(operationName, data = null) {
        this.info(`✅ Completado: ${operationName}`, data);
    }

    /**
     * Log de fallo
     */
    fail(operationName, error) {
        this.error(`❌ Falló: ${operationName}`, { 
            message: error.message, 
            stack: error.stack 
        });
    }

    /**
     * Log de request HTTP
     */
    httpRequest(method, path, statusCode, duration = 0) {
        const color = statusCode < 400 ? '\x1b[32m' : statusCode < 500 ? '\x1b[33m' : '\x1b[31m';
        const message = `${color}${method} ${path} ${statusCode}${LOG_COLORS.RESET} (${duration}ms)`;
        console.log(`[${new Date().toISOString()}] ${message}`);
        
        const formatted = this._formatMessage('HTTP', `${method} ${path} ${statusCode}`, { duration });
        this._writeToFile(formatted);
    }
}

// Exportar factory para crear loggers por módulo
export const createLogger = (module = 'App') => new Logger(module);

// Exportar instancia por defecto
export default new Logger('Global');
