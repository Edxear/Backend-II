import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import { Strategy as GitHubStrategy } from 'passport-github2';
import User from '../dao/models/userModel.js';
import bcrypt from 'bcrypt';

// Configuración de Passport para autenticación local
passport.use('register', new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password',
    passReqToCallback: true
}, async (req, email, password, done) => {
    try {
        const { first_name, last_name, age } = req.body;

        // Verificar si el usuario ya existe
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return done(null, false, { message: 'El email ya está registrado' });
        }

        // Hash de la contraseña
        const hashedPassword = await bcrypt.hash(password, 10);

        // Crear nuevo usuario
        const newUser = new User({
            first_name,
            last_name,
            email,
            age,
            password: hashedPassword
        });

        await newUser.save();
        return done(null, newUser);
    } catch (error) {
        return done(error);
    }
}));

passport.use('login', new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password'
}, async (email, password, done) => {
    try {
        // Verificar si es el admin
        if (email === 'adminCoder@coder.com' && password === 'adminCod3r123') {
            const adminUser = {
                first_name: 'Admin',
                last_name: 'Coder',
                email: 'adminCoder@coder.com',
                age: 99,
                role: 'admin'
            };
            return done(null, adminUser);
        }

        // Buscar usuario en la base de datos
        const user = await User.findOne({ email });
        if (!user) {
            return done(null, false, { message: 'Credenciales inválidas' });
        }

        // Verificar contraseña
        const isValidPassword = await bcrypt.compare(password, user.password);
        if (!isValidPassword) {
            return done(null, false, { message: 'Credenciales inválidas' });
        }

        return done(null, user);
    } catch (error) {
        return done(error);
    }
}));

// Configuración de Passport para GitHub
if (process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET) {
    passport.use(new GitHubStrategy({
        clientID: process.env.GITHUB_CLIENT_ID,
        clientSecret: process.env.GITHUB_CLIENT_SECRET,
        callbackURL: process.env.GITHUB_CALLBACK_URL || "http://localhost:8080/api/sessions/github/callback"
    }, async (accessToken, refreshToken, profile, done) => {
        try {
            // Buscar usuario por email de GitHub
            let user = await User.findOne({ email: profile.emails[0].value });

            if (user) {
                // Si el usuario existe, actualizar información si es necesario
                return done(null, user);
            } else {
                // Crear nuevo usuario con datos de GitHub
                const newUser = new User({
                    first_name: profile.displayName.split(' ')[0] || profile.username,
                    last_name: profile.displayName.split(' ').slice(1).join(' ') || '',
                    email: profile.emails[0].value,
                    age: 0, // GitHub no proporciona edad
                    password: '', // No necesitamos contraseña para OAuth
                    role: 'usuario'
                });

                await newUser.save();
                return done(null, newUser);
            }
        } catch (error) {
            return done(error);
        }
    }));
}

// Serialización y deserialización
passport.serializeUser((user, done) => {
    done(null, user._id || user.email);
});

passport.deserializeUser(async (id, done) => {
    try {
        // Para admin, devolver directamente
        if (id === 'adminCoder@coder.com') {
            const adminUser = {
                first_name: 'Admin',
                last_name: 'Coder',
                email: 'adminCoder@coder.com',
                age: 99,
                role: 'admin'
            };
            return done(null, adminUser);
        }

        const user = await User.findById(id);
        done(null, user);
    } catch (error) {
        done(error);
    }
});

export default passport;