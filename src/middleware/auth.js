import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key';

// Middleware para validar JWT desde cookies (prioriza cookies firmadas)
export const authMiddleware = (req, res, next) => {
    const token = (req.signedCookies && req.signedCookies.currentUser) || (req.cookies && req.cookies.currentUser);

    if (!token) {
        return next();
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded;
    } catch (error) {
        console.error('Invalid JWT:', error);
        // Eliminar cookie inválida
        if (req.signedCookies && req.signedCookies.currentUser) res.clearCookie('currentUser');
        else if (req.cookies && req.cookies.currentUser) res.clearCookie('currentUser');
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

// Middleware para aplicar políticas de autorización
export const handlePolicies = (policies = []) => {
    return (req, res, next) => {
        if (!policies || policies.length === 0) return next();
        if (policies.includes('PUBLIC')) return next();

        const user = req.user;
        if (!user) return res.status(401).json({ status: 'error', error: 'Unauthorized' });

        const role = user.role;
        if (!role) return res.status(403).json({ status: 'error', error: 'Forbidden' });

        const allowed = Array.isArray(role) ? role.some(r => policies.includes(r)) : policies.includes(role);
        if (!allowed) return res.status(403).json({ status: 'error', error: 'Forbidden' });

        next();
    };
};