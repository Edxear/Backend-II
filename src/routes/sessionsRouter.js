import { Router } from 'express';
import jwt from 'jsonwebtoken';
import UserDBManager from '../dao/userDBManager.js';

const router = Router();
const userManager = new UserDBManager();

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key';

// POST /api/users/register - Registrar nuevo usuario
router.post('/register', async (req, res) => {
    try {
        const { first_name, last_name, email, password } = req.body;

        // Validar que todos los campos estén presentes
        if (!first_name || !last_name || !email || !password) {
            return res.status(400).json({ 
                success: false, 
                message: 'All fields are required' 
            });
        }

        // Verificar si el usuario ya existe
        const existingUser = await userManager.findByEmail(email);
        if (existingUser) {
            return res.status(400).json({ 
                success: false, 
                message: 'User already exists' 
            });
        }

        // Crear nuevo usuario
        const newUser = await userManager.create({
            first_name,
            last_name,
            email,
            password,
            role: 'user'
        });

        res.status(201).json({
            success: true,
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
        res.status(500).json({ 
            success: false, 
            message: 'Error registering user' 
        });
    }
});

// POST /api/users/login - Login y generar JWT
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Validar que email y password estén presentes
        if (!email || !password) {
            return res.status(400).json({ 
                success: false, 
                message: 'Email and password are required' 
            });
        }

        // Buscar usuario por email
        const user = await userManager.findByEmail(email);
        if (!user) {
            return res.redirect('/login?error=Login failed!');
        }

        // Validar contraseña
        const isPasswordValid = await userManager.validatePassword(user, password);
        if (!isPasswordValid) {
            return res.redirect('/login?error=Login failed!');
        }

        // Generar JWT
        const token = jwt.sign(
            {
                id: user._id,
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

        // Redirigir a /current
        res.redirect('/current');
    } catch (error) {
        console.error('Login error:', error);
        res.redirect('/login?error=Login failed!');
    }
});

// GET /api/users - Obtener todos los usuarios
router.get('/', async (req, res) => {
    try {
        const users = await userManager.findAll();
        res.json({
            success: true,
            users: users.map(user => ({
                id: user._id,
                first_name: user.first_name,
                last_name: user.last_name,
                email: user.email,
                role: user.role
            }))
        });
    } catch (error) {
        console.error('Get users error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Error fetching users' 
        });
    }
});

// GET /api/users/:id - Obtener usuario por ID
router.get('/:id', async (req, res) => {
    try {
        const user = await userManager.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ 
                success: false, 
                message: 'User not found' 
            });
        }
        res.json({
            success: true,
            user: {
                id: user._id,
                first_name: user.first_name,
                last_name: user.last_name,
                email: user.email,
                role: user.role
            }
        });
    } catch (error) {
        console.error('Get user error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Error fetching user' 
        });
    }
});

// PUT /api/users/:id - Actualizar usuario
router.put('/:id', async (req, res) => {
    try {
        const { first_name, last_name, email, role } = req.body;
        const updateData = {};

        if (first_name) updateData.first_name = first_name;
        if (last_name) updateData.last_name = last_name;
        if (email) updateData.email = email;
        if (role) updateData.role = role;

        const updatedUser = await userManager.update(req.params.id, updateData);
        if (!updatedUser) {
            return res.status(404).json({ 
                success: false, 
                message: 'User not found' 
            });
        }

        res.json({
            success: true,
            message: 'User updated successfully',
            user: {
                id: updatedUser._id,
                first_name: updatedUser.first_name,
                last_name: updatedUser.last_name,
                email: updatedUser.email,
                role: updatedUser.role
            }
        });
    } catch (error) {
        console.error('Update user error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Error updating user' 
        });
    }
});

// DELETE /api/users/:id - Eliminar usuario
router.delete('/:id', async (req, res) => {
    try {
        const deletedUser = await userManager.delete(req.params.id);
        if (!deletedUser) {
            return res.status(404).json({ 
                success: false, 
                message: 'User not found' 
            });
        }

        res.json({
            success: true,
            message: 'User deleted successfully'
        });
    } catch (error) {
        console.error('Delete user error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Error deleting user' 
        });
    }
});

// POST /api/users/logout - Logout
router.post('/logout', (req, res) => {
    res.clearCookie('currentUser');
    res.json({ success: true, message: 'Logged out successfully' });
});

export default router;