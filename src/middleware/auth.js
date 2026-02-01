import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key';

// Middleware para validar JWT desde cookies
export const authMiddleware = (req, res, next) => {
    const token = req.cookies.currentUser;

    if (!token) {
        return next();
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded;
    } catch (error) {
        res.clearCookie('currentUser');
    }

    next();
};

// Middleware para proteger rutas (requiere estar logueado)
export const protectedRoute = (req, res, next) => {
    if (!req.user) {
        return res.redirect('/login');
    }
    next();
};

// Middleware para proteger acceso de usuarios logueados a login
export const notAuthenticated = (req, res, next) => {
    if (req.user) {
        return res.redirect('/current');
    }
    next();
};