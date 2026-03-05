import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Cargar variables de entorno
dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const config = {
    // Server
    PORT: process.env.PORT || 8083,
    NODE_ENV: process.env.NODE_ENV || 'development',
    
    // Database
    MONGODB_URI: process.env.MONGODB_URI || 'mongodb://localhost:27017',
    DB_NAME: process.env.DB_NAME || 'integrative_practice',
    
    // JWT
    JWT_SECRET: process.env.JWT_SECRET || 'your_jwt_secret_key_change_this_in_production',
    JWT_EXPIRE: '24h',
    
    // Session
    SESSION_SECRET: process.env.SESSION_SECRET || 's3cr3t0',
    COOKIE_SECRET: process.env.COOKIE_SECRET || 's3cr3t0',
    
    // GitHub OAuth
    GITHUB_CLIENT_ID: process.env.GITHUB_CLIENT_ID || null,
    GITHUB_CLIENT_SECRET: process.env.GITHUB_CLIENT_SECRET || null,
    GITHUB_CALLBACK_URL: process.env.GITHUB_CALLBACK_URL || 'http://localhost:8083/api/sessions/github/callback',
    
    // Security
    CORS_ORIGIN: process.env.CORS_ORIGIN || 'http://localhost:8083',
    
    // Twilio
    TWILIO_ACCOUNT_SID: process.env.TWILIO_ACCOUNT_SID,
    TWILIO_AUTH_TOKEN: process.env.TWILIO_AUTH_TOKEN,
    TWILIO_SMS_NUMBER: process.env.TWILIO_SMS_NUMBER,
    
    // Email
    EMAIL_USER: process.env.EMAIL_USER,
    EMAIL_PASS: process.env.EMAIL_PASS,
    EMAIL_SERVICE: process.env.EMAIL_SERVICE || 'gmail',
    
    // Paths
    __dirname,
    
    // Helpers
    isProduction: () => config.NODE_ENV === 'production',
    isDevelopment: () => config.NODE_ENV === 'development'
};

// Validar variables críticas solo en producción
if (config.isProduction()) {
    const required = ['MONGODB_URI', 'JWT_SECRET'];
    const missing = required.filter(v => !process.env[v]);
    if (missing.length > 0) {
        throw new Error(`❌ Missing required env vars: ${missing.join(', ')}`);
    }
}

export default config;