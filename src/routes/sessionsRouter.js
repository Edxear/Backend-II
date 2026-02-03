import jwt from 'jsonwebtoken';
import CustomRouter from '../utils/customRouter.js';
import UserDBManager from '../dao/userDBManager.js';
import { handlePolicies } from '../middleware/auth.js';

const custom = new CustomRouter();
const userManager = new UserDBManager();

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key';

// POST /api/users/register - Registrar nuevo usuario
custom.post('/register', async (req, res) => {
    try {
        const { first_name, last_name, email, password } = req.body;

        // Validar que todos los campos estén presentes
        if (!first_name || !last_name || !email || !password) {
            return res.sendUserError('All fields are required', 400);
        }

        // Verificar si el usuario ya existe
        const existingUser = await userManager.findByEmail(email);
        if (existingUser) {
            return res.sendUserError('User already exists', 400);
        }

        // Crear nuevo usuario
        const newUser = await userManager.create({
            first_name,
            last_name,
            email,
            password,
            role: 'user'
        });

        res.sendCreated({
            message: 'User registered successfully',
            user: {
                id: newUser._id,
                first_name: newUser.first_name,
                last_name: newUser.last_name,
                email: newUser.email,
                role: newUser.role
            }
        });
    } catch (error) {
        console.error('Register error:', error);
        res.sendServerError('Error registering user');
    }
});

// POST /api/users/login - Login y generar JWT
custom.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Validar que email y password estén presentes
        if (!email || !password) {
            return res.sendUserError('Email and password are required', 400);
        }

        // Buscar usuario por email
        const user = await userManager.findByEmail(email);
        if (!user) {
            // Mantener compatibilidad con redirección para vistas
            if (req.headers.accept && req.headers.accept.includes('text/html')) return res.redirect('/login?error=Login failed!');
            return res.sendUserError('Login failed', 401);
        }

        // Validar contraseña
        const isPasswordValid = await userManager.validatePassword(user, password);
        if (!isPasswordValid) {
            if (req.headers.accept && req.headers.accept.includes('text/html')) return res.redirect('/login?error=Login failed!');
            return res.sendUserError('Login failed', 401);
        }

        // Generar JWT
        const token = jwt.sign(
            {
                id: user._id.toString(),
                first_name: user.first_name,
                last_name: user.last_name,
                email: user.email,
                role: user.role
            },
            JWT_SECRET,
            { expiresIn: '24h' }
        );

        // Almacenar JWT en cookie firmada
        res.cookie('currentUser', token, {
            httpOnly: true,
            signed: true,
            maxAge: 24 * 60 * 60 * 1000 // 24 horas
        });

        // Redirigir a /current para flujo de vistas
        return res.redirect('/current');
    } catch (error) {
        console.error('Login error:', error);
        if (req.headers.accept && req.headers.accept.includes('text/html')) return res.redirect('/login?error=Login failed!');
        res.sendServerError('Login failed');
    }
});

// GET /api/users - Obtener todos los usuarios (admin only)
custom.get('/', ['admin'], async (req, res) => {
    try {
        const users = await userManager.findAll();
        res.sendSuccess({ users: users.map(user => ({
            id: user._id,
            first_name: user.first_name,
            last_name: user.last_name,
            email: user.email,
            role: user.role
        })) });
    } catch (error) {
        console.error('Get users error:', error);
        res.sendServerError('Error fetching users');
    }
});

// GET /api/users/:id - Obtener usuario por ID (admin or self)
custom.get('/:id', async (req, res) => {
    try {
        if (!req.user) return res.sendUserError('Unauthorized', 401);
        const requestedId = req.params.id;
        if (req.user.role !== 'admin' && req.user.id !== requestedId) return res.sendUserError('Forbidden', 403);

        const user = await userManager.findById(requestedId);
        if (!user) return res.sendUserError('User not found', 404);

        res.sendSuccess({ user: {
            id: user._id,
            first_name: user.first_name,
            last_name: user.last_name,
            email: user.email,
            role: user.role
        } });
    } catch (error) {
        console.error('Get user error:', error);
        res.sendServerError('Error fetching user');
    }
});

// PUT /api/users/:id - Actualizar usuario (admin or self)
custom.put('/:id', async (req, res) => {
    try {
        if (!req.user) return res.sendUserError('Unauthorized', 401);
        const requestedId = req.params.id;
        if (req.user.role !== 'admin' && req.user.id !== requestedId) return res.sendUserError('Forbidden', 403);

        const { first_name, last_name, email, role } = req.body;
        const updateData = {};

        if (first_name) updateData.first_name = first_name;
        if (last_name) updateData.last_name = last_name;
        if (email) updateData.email = email;
        if (role && req.user.role === 'admin') updateData.role = role; // only admin can change role

        const updatedUser = await userManager.update(requestedId, updateData);
        if (!updatedUser) return res.sendUserError('User not found', 404);

        res.sendSuccess({ message: 'User updated successfully', user: {
            id: updatedUser._id,
            first_name: updatedUser.first_name,
            last_name: updatedUser.last_name,
            email: updatedUser.email,
            role: updatedUser.role
        } });
    } catch (error) {
        console.error('Update user error:', error);
        res.sendServerError('Error updating user');
    }
});

// DELETE /api/users/:id - Eliminar usuario (admin only)
custom.delete('/:id', ['admin'], async (req, res) => {
    try {
        const deletedUser = await userManager.delete(req.params.id);
        if (!deletedUser) return res.sendUserError('User not found', 404);
        res.sendSuccess({ message: 'User deleted successfully' });
    } catch (error) {
        console.error('Delete user error:', error);
        res.sendServerError('Error deleting user');
    }
});

// POST /api/users/logout - Logout
custom.post('/logout', (req, res) => {
    res.clearCookie('currentUser');
    res.sendSuccess({ message: 'Logged out successfully' });
});

export default custom.getRouter();