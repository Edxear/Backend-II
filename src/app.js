import express from 'express';
import handlebars from 'express-handlebars';
import {Server} from 'socket.io';
import cookieParser from 'cookie-parser';
import session from 'express-session';
import dotenv from 'dotenv';
import passport from './config/passport.js';

import productRouter from './routes/productRouter.js';
import cartRouter from './routes/cartRouter.js';
import viewsRouter from './routes/viewsRouter.js';
import sessionsRouter from './routes/sessionsRouter.js';
import __dirname from './utils/constantsUtil.js';
import websocket from './websocket.js';
import { connDB } from './config/db.js';

const app = express();

// Load environment variables
dotenv.config();

// Database connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://Edxear_db_user:LbVnPHiwL8OiIdqk@cluster0.mvdipph.mongodb.net';
const DB_NAME = process.env.DB_NAME || 'integrative_practice';

connDB(MONGODB_URI, DB_NAME);


app.engine('handlebars', handlebars.engine());
app.set('views', __dirname + '/../views');
app.set('view engine', 'handlebars');

//Middlewares
app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(express.static('public'));

// Cookies y sesiones
app.use(cookieParser("s3cr3t0"));
app.use(session({
    secret: "s3cr3t0",
    resave: true,
    saveUninitialized: true
}));

// Passport
app.use(passport.initialize());
app.use(passport.session());

// Routers
app.use('/api/products', productRouter);
app.use('/api/carts', cartRouter);
app.use('/api/sessions', sessionsRouter);
app.use('/api/users', sessionsRouter);
app.use('/', viewsRouter);

// Server
const PORT = process.env.PORT || 8083;
const httpServer = app.listen(PORT, () => {
    console.log(`Start server in PORT ${PORT}`);
});

websocket(httpServer);
