import UserMemoryManager from '../dao/userMemoryManager.js';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

class UserRepository {
    constructor() {
        this.dao = new UserMemoryManager();
    }

    async create(userData) {
        return await this.dao.create(userData);
    }

    async findById(id) {
        return await this.dao.findById(id);
    }

    async findByEmail(email) {
        return await this.dao.findByEmail(email);
    }

    async findAll() {
        return await this.dao.findAll();
    }

    async update(id, userData) {
        return await this.dao.update(id, userData);
    }

    async delete(id) {
        return await this.dao.delete(id);
    }

    async validatePassword(user, password) {
        return await this.dao.validatePassword(user, password);
    }

    async generateResetToken() {
        return crypto.randomBytes(32).toString('hex');
    }

    async setResetToken(email) {
        const user = await this.findByEmail(email);
        if (!user) throw new Error('User not found');

        const resetToken = await this.generateResetToken();
        const resetExpires = new Date(Date.now() + 3600000); // 1 hour

        await this.update(user._id, {
            resetPasswordToken: resetToken,
            resetPasswordExpires: resetExpires
        });

        return resetToken;
    }

    async resetPassword(token, newPassword) {
        const user = await this.dao.findByResetToken(token);

        if (!user) throw new Error('Invalid or expired token');

        // Check if new password is same as old
        const isSame = await bcrypt.compare(newPassword, user.password);
        if (isSame) throw new Error('New password cannot be the same as the old one');

        await this.update(user._id, {
            password: newPassword,
            resetPasswordToken: undefined,
            resetPasswordExpires: undefined
        });

        return user;
    }
}

export default UserRepository;