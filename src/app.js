import express from 'express';
import handlebars from 'express-handlebars';
import { Server } from 'socket.io';
import cookieParser from 'cookie-parser';
import session from 'express-session';
import passport from './config/passport.js';
import { authMiddleware } from './middleware/auth.js';
import config from './config/config.js';
import twilio from 'twilio';

import productRouter from './routes/productRouter.js';
import cartRouter from './routes/cartRouter.js';
import viewsRouter from './routes/viewsRouter.js';
import sessionsRouter from './routes/sessionsRouter.js';
import __dirname from './utils/constantsUtil.js';
import websocket from './websocket.js';
import { connDB } from './config/db.js';

const app = express();

const TWILIO_ACCOUNT_SID = config.TWILIO_ACCOUNT_SID
const TWILIO_AUTH_TOKEN = config.TWILIO_AUTH_TOKEN
const TWILIO_SMS_NUMBER = config.TWILIO_SMS_NUMBER

const client = twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN)

app.get("/sms", async (req, res) => {
    let result = await client.messages.create({
        body: "Es un mensaje desde mi aplicacion backend",
        from: TWILIO_SMS_NUMBER,
        to: "+543446595326"
    })

    res.send({ status: "success", result: "Mensaje enviado" })
})


// Database connection
connDB(config.MONGODB_URI, config.DB_NAME);

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
    resave: true,
    saveUninitialized: true
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
app.use('/', viewsRouter);

// Server
const httpServer = app.listen(config.PORT, () => {
    console.log(`Start server in PORT ${config.PORT}`);
});

websocket(httpServer);
