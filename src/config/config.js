import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import crypto from 'crypto';

// Cargar variables de entorno
dotenv.config();

/**
 * Genera una clave secreta segura para desarrollo
 * En serverless puede usarse como fallback para evitar caída de la app
 */
function generateSecretKey(type) {
  if ((process.env.NODE_ENV || 'development') === 'production') {
    console.warn(
      `⚠️ ${type.toUpperCase()}_SECRET no configurado. Usando clave efimera (no recomendado para prod).`
    );
  }
  return crypto.randomBytes(32).toString('hex');
}

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const config = {
  // Server
  PORT: process.env.PORT || 8083,
  NODE_ENV: process.env.NODE_ENV || 'development',

  // Database
  MONGODB_URI: process.env.MONGODB_URI || 'mongodb://localhost:27017',
  DB_NAME: process.env.DB_NAME || 'integrative_practice',

  // JWT
  JWT_SECRET: process.env.JWT_SECRET || generateSecretKey('jwt'),
  JWT_EXPIRE: '24h',

  // Session
  SESSION_SECRET: process.env.SESSION_SECRET || generateSecretKey('session'),
  COOKIE_SECRET: process.env.COOKIE_SECRET || generateSecretKey('cookie'),

  // GitHub OAuth
  GITHUB_CLIENT_ID: process.env.GITHUB_CLIENT_ID || null,
  GITHUB_CLIENT_SECRET: process.env.GITHUB_CLIENT_SECRET || null,
  GITHUB_CALLBACK_URL:
    process.env.GITHUB_CALLBACK_URL || 'http://localhost:8083/api/sessions/github/callback',

  // Security
  CORS_ORIGIN: process.env.CORS_ORIGIN || 'http://localhost:8083',
  TRUST_PROXY: process.env.TRUST_PROXY === 'true',
  RATE_LIMIT_WINDOW_MS: Number(process.env.RATE_LIMIT_WINDOW_MS || 15 * 60 * 1000),
  RATE_LIMIT_MAX: Number(process.env.RATE_LIMIT_MAX || 200),

  // Session Cookie
  SESSION_MAX_AGE_MS: Number(process.env.SESSION_MAX_AGE_MS || 1000 * 60 * 60 * 4),
  SESSION_SAME_SITE: process.env.SESSION_SAME_SITE || 'lax',
  SESSION_STORE_TTL_SECONDS: Number(process.env.SESSION_STORE_TTL_SECONDS || 60 * 60 * 24),

  // Twilio
  TWILIO_ACCOUNT_SID: process.env.TWILIO_ACCOUNT_SID,
  TWILIO_AUTH_TOKEN: process.env.TWILIO_AUTH_TOKEN,
  TWILIO_SMS_NUMBER: process.env.TWILIO_SMS_NUMBER,

  // Email
  EMAIL_USER: process.env.EMAIL_USER,
  EMAIL_PASS: process.env.EMAIL_PASS,
  EMAIL_SERVICE: process.env.EMAIL_SERVICE || 'gmail',

  // Monitoring
  SENTRY_DSN: process.env.SENTRY_DSN || null,
  SENTRY_TRACES_SAMPLE_RATE: Number(process.env.SENTRY_TRACES_SAMPLE_RATE || 0.1),

  // Paths
  __dirname,

  // Helpers
  isProduction: () => config.NODE_ENV === 'production',
  isDevelopment: () => config.NODE_ENV === 'development',
};

// Validación no bloqueante: advertir en lugar de romper arranque.
if (config.isProduction()) {
  const required = ['MONGODB_URI', 'JWT_SECRET', 'SESSION_SECRET', 'COOKIE_SECRET'];
  const missing = required.filter((v) => !process.env[v]);
  if (missing.length > 0) {
    console.warn(`⚠️ Missing env vars in production: ${missing.join(', ')}`);
  }
}

export default config;
