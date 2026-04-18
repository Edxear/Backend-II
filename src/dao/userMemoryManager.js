import bcrypt from 'bcryptjs';
import crypto from 'crypto';

// In-memory user store with a default admin user
const users = new Map();

// Default admin user (no hashed password needed - handled in passport login strategy)
const ADMIN_USER = {
    _id: 'admin',
    first_name: 'Admin',
    last_name: 'Coder',
    email: 'adminCoder@coder.com',
    age: 99,
    role: 'admin',
    password: null,
};

class UserMemoryManager {
    async create(userData) {
        const existingByEmail = await this.findByEmail(userData.email);
        if (existingByEmail) throw new Error('El email ya está registrado');

        const hashedPassword = await bcrypt.hash(userData.password, 10);
        const id = crypto.randomBytes(12).toString('hex');

        const newUser = {
            _id: id,
            first_name: userData.first_name,
            last_name: userData.last_name,
            email: userData.email.toLowerCase(),
            age: userData.age || 0,
            password: hashedPassword,
            role: userData.role || 'user',
            resetPasswordToken: null,
            resetPasswordExpires: null,
        };

        users.set(id, newUser);
        return newUser;
    }

    async findById(id) {
        if (id === 'admin' || id === 'adminCoder@coder.com') return ADMIN_USER;
        return users.get(String(id)) || null;
    }

    async findByEmail(email) {
        if (!email) return null;
        const lc = email.toLowerCase();
        if (lc === 'adminCoder@coder.com'.toLowerCase()) return ADMIN_USER;
        for (const user of users.values()) {
            if (user.email === lc) return user;
        }
        return null;
    }

    async findAll() {
        return [ADMIN_USER, ...Array.from(users.values())];
    }

    async update(id, userData) {
        const user = users.get(String(id));
        if (!user) throw new Error('User not found');

        let updateData = { ...userData };
        if (userData.password) {
            updateData.password = await bcrypt.hash(userData.password, 10);
        }

        Object.assign(user, updateData);
        return user;
    }

    async delete(id) {
        const user = users.get(String(id));
        if (user) users.delete(String(id));
        return user || null;
    }

    async validatePassword(user, password) {
        if (!user.password) return false;
        return await bcrypt.compare(password, user.password);
    }

    async findByResetToken(token) {
        for (const user of users.values()) {
            if (
                user.resetPasswordToken === token &&
                user.resetPasswordExpires &&
                user.resetPasswordExpires > Date.now()
            ) {
                return user;
            }
        }
        return null;
    }
}

export default UserMemoryManager;
