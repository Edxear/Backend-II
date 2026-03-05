import nodemailer from 'nodemailer';
import config from '../config/config.js';

class EmailService {
    constructor() {
        this.transporter = nodemailer.createTransport({
            service: config.EMAIL_SERVICE,
            auth: {
                user: config.EMAIL_USER,
                pass: config.EMAIL_PASS
            }
        });
    }

    async sendPasswordResetEmail(email, resetToken) {
        const resetUrl = `http://localhost:${config.PORT}/reset-password/${resetToken}`;

        const mailOptions = {
            from: config.EMAIL_USER,
            to: email,
            subject: 'Password Reset Request',
            html: `
                <h2>Password Reset</h2>
                <p>You requested a password reset. Click the link below to reset your password:</p>
                <a href="${resetUrl}">Reset Password</a>
                <p>This link will expire in 1 hour.</p>
                <p>If you didn't request this, please ignore this email.</p>
            `
        };

        return await this.transporter.sendMail(mailOptions);
    }
}

export default new EmailService();