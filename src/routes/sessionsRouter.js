import jwt from 'jsonwebtoken';
import CustomRouter from '../utils/customRouter.js';
import UserDBManager from '../dao/userDBManager.js';
import { handlePolicies, authMiddleware } from '../middleware/auth.js';
import passport from 'passport';
import UserDTO from '../dtos/UserDTO.js';
import UserRepository from '../repositories/UserRepository.js';
import emailService from '../services/emailService.js';

const custom = new CustomRouter();
const userManager = new UserDBManager();
const userRepo = new UserRepository();

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key';

// GET /api/sessions/current - Validar usuario logueado y obtener sus datos
custom.get('/current', (req, res, next) => {
    passport.authenticate('current', { session: false }, (err, user, info) => {
        if (err) {
            return res.status(500).json({ status: 'error', message: 'Internal server error' });
        }

        if (!user) {
            return res.status(401).json({ status: 'error', message: 'Token inválido o no proporcionado' });
        }

        // Usuario autenticado mediante JWT
        const userDTO = new UserDTO(user);
        return res.status(200).json({
            status: 'success',
            message: 'Usuario validado correctamente',
            user: userDTO
        });
    })(req, res, next);
});

// POST /api/sessions/forgot-password - Solicitar reset de contraseña
custom.post('/forgot-password', async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) {
            return res.sendUserError('Email is required', 400);
        }

        const resetToken = await userRepo.setResetToken(email);
        await emailService.sendPasswordResetEmail(email, resetToken);

        res.sendSuccess({ message: 'Password reset email sent' });
    } catch (error) {
        res.sendUserError(error.message, 400);
    }
});

// POST /api/sessions/reset-password - Resetear contraseña
custom.post('/reset-password', async (req, res) => {
    try {
        const { token, newPassword } = req.body;
        if (!token || !newPassword) {
            return res.sendUserError('Token and new password are required', 400);
        }

        const user = await userRepo.resetPassword(token, newPassword);
        res.sendSuccess({ message: 'Password reset successfully' });
    } catch (error) {
        res.sendUserError(error.message, 400);
    }
});

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

// DELETE /api/users/:id - Eliminar usuario
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

// GET /reset-password/:token - Mostrar formulario de reset (para vistas)
custom.get('/reset-password/:token', (req, res) => {
    try {
        const { token } = req.params;
        
        res.send(`
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Reset Password</title>
                <style>
                    body {
                        font-family: Arial, sans-serif;
                        display: flex;
                        justify-content: center;
                        align-items: center;
                        min-height: 100vh;
                        margin: 0;
                        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    }
                    .container {
                        background: white;
                        padding: 40px;
                        border-radius: 10px;
                        box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
                        width: 100%;
                        max-width: 400px;
                    }
                    h1 {
                        text-align: center;
                        color: #333;
                        margin-bottom: 30px;
                    }
                    .form-group {
                        margin-bottom: 20px;
                    }
                    label {
                        display: block;
                        margin-bottom: 8px;
                        color: #555;
                        font-weight: bold;
                    }
                    input {
                        width: 100%;
                        padding: 12px;
                        border: 1px solid #ddd;
                        border-radius: 5px;
                        font-size: 16px;
                        box-sizing: border-box;
                    }
                    input:focus {
                        outline: none;
                        border-color: #667eea;
                        box-shadow: 0 0 5px rgba(102, 126, 234, 0.3);
                    }
                    button {
                        width: 100%;
                        padding: 12px;
                        background: #667eea;
                        color: white;
                        border: none;
                        border-radius: 5px;
                        font-size: 16px;
                        font-weight: bold;
                        cursor: pointer;
                        transition: background 0.3s;
                    }
                    button:hover {
                        background: #764ba2;
                    }
                    .message {
                        margin-top: 20px;
                        padding: 10px;
                        border-radius: 5px;
                        text-align: center;
                        display: none;
                    }
                    .message.success {
                        background: #d4edda;
                        color: #155724;
                        display: block;
                    }
                    .message.error {
                        background: #f8d7da;
                        color: #721c24;
                        display: block;
                    }
                </style>
            </head>
            <body>
                <div class="container">
                    <h1>Reset Your Password</h1>
                    <form id="resetForm">
                        <div class="form-group">
                            <label for="password">New Password:</label>
                            <input type="password" id="password" name="password" required>
                        </div>
                        <div class="form-group">
                            <label for="confirmPassword">Confirm Password:</label>
                            <input type="password" id="confirmPassword" name="confirmPassword" required>
                        </div>
                        <button type="submit">Reset Password</button>
                        <div id="message" class="message"></div>
                    </form>
                </div>

                <script>
                    document.getElementById('resetForm').addEventListener('submit', async (e) => {
                        e.preventDefault();
                        
                        const password = document.getElementById('password').value;
                        const confirmPassword = document.getElementById('confirmPassword').value;
                        const messageEl = document.getElementById('message');

                        if (password !== confirmPassword) {
                            messageEl.className = 'message error';
                            messageEl.textContent = 'Passwords do not match';
                            return;
                        }

                        try {
                            const response = await fetch('/api/sessions/reset-password', {
                                method: 'POST',
                                headers: {
                                    'Content-Type': 'application/json'
                                },
                                body: JSON.stringify({
                                    token: '${token}',
                                    newPassword: password
                                })
                            });

                            const data = await response.json();

                            if (response.ok) {
                                messageEl.className = 'message success';
                                messageEl.textContent = 'Password reset successfully! Redirecting to login...';
                                setTimeout(() => {
                                    window.location.href = '/login';
                                }, 2000);
                            } else {
                                messageEl.className = 'message error';
                                messageEl.textContent = data.error || 'Error resetting password';
                            }
                        } catch (error) {
                            messageEl.className = 'message error';
                            messageEl.textContent = 'An error occurred. Please try again.';
                        }
                    });
                </script>
            </body>
            </html>
        `);
    } catch (error) {
        console.error('Reset password form error:', error);
        res.status(500).send('Error loading reset password form');
    }
});

export default custom.getRouter();