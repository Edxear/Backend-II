import express from 'express';
import handlebars from 'express-handlebars';
import cookieParser from 'cookie-parser';
import session from 'express-session';
import passport from './config/passport.js';
import { authMiddleware } from './middleware/auth.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';
import config from './config/config.js';
import { createLogger } from './utils/loggerUtil.js';

import productRouter from './routes/productRouter.js';
import cartRouter from './routes/cartRouter.js';
import viewsRouter from './routes/viewsRouter.js';
import sessionsRouter from './routes/sessionsRouter.js';
import servicesRouter from './routes/servicesRouter.js';
import __dirname from './utils/constantsUtil.js';
import websocket from './websocket.js';

const logger = createLogger('App');
const app = express();

if (config.TWILIO_ACCOUNT_SID && config.TWILIO_AUTH_TOKEN) {
    logger.info('✅ Twilio configurado correctamente');
} else {
    logger.warn('⚠️ Credenciales de Twilio no configuradas. SMS no disponible.');
}

app.engine('handlebars', handlebars.engine());
app.set('views', __dirname + '/../views');
app.set('view engine', 'handlebars');

//Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

// Cookies y sesiones
app.use(cookieParser(config.COOKIE_SECRET));
app.use(session({
    secret: config.SESSION_SECRET,
    name: 'sid',
    resave: false,
    saveUninitialized: false,
    cookie: {
        httpOnly: true,
        secure: config.isProduction(),
        sameSite: config.SESSION_SAME_SITE || 'lax',
        maxAge: config.SESSION_MAX_AGE_MS || 1000 * 60 * 60 * 4,
    }
}));

// Passport
app.use(passport.initialize());
app.use(passport.session());

// Auth Middleware
app.use(authMiddleware);

// Routers
app.use('/api/products', productRouter);
app.use('/api/carts', cartRouter);
app.use('/api/sessions', sessionsRouter);
app.use('/api/users', sessionsRouter);
app.use('/api/services', servicesRouter);
app.use('/', viewsRouter);

// 404 Handler
app.use(notFoundHandler);

// Error Handler
app.use(errorHandler);

export default app;

export const startServer = async () => {
    try {
        const httpServer = app.listen(config.PORT, () => {
            logger.info(`▶️  Servidor iniciado en puerto ${config.PORT}`);
            logger.info(`📍 URL: http://localhost:${config.PORT}`);
        });

        websocket(httpServer);
        return httpServer;
    } catch (error) {
        logger.error('Error fatal en inicialización', error);
        process.exit(1);
    }
};

const isDirectRun = process.argv[1] && process.argv[1].replace(/\\/g, '/').endsWith('src/app.js');

if (isDirectRun) {
    startServer();
}
