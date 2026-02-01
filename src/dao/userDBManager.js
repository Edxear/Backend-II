import UserModel from './models/userModel.js';
import bcrypt from 'bcryptjs';

class UserDBManager {
    async create(userData) {
        try {
            // Hash de la contraseña antes de guardar.
            const hashedPassword = await bcrypt.hash(userData.password, 10);
            
            const newUser = new UserModel({
                first_name: userData.first_name,
                last_name: userData.last_name,
                email: userData.email,
                password: hashedPassword,
                role: userData.role || 'user'
            });
            
            return await newUser.save();
        } catch (error) {
            throw new Error(`Error creating user: ${error.message}`);
        }
    }

    async findById(id) {
        try {
            return await UserModel.findById(id);
        } catch (error) {
            throw new Error(`Error finding user: ${error.message}`);
        }
    }

    async findByEmail(email) {
        try {
            return await UserModel.findOne({ email: email.toLowerCase() });
        } catch (error) {
            throw new Error(`Error finding user by email: ${error.message}`);
        }
    }

    async findAll() {
        try {
            return await UserModel.find();
        } catch (error) {
            throw new Error(`Error finding all users: ${error.message}`);
        }
    }

    async update(id, userData) {
        try {
            let updateData = { ...userData };
            
            
            if (userData.password) {
                updateData.password = await bcrypt.hash(userData.password, 10);
            }
            
            return await UserModel.findByIdAndUpdate(id, updateData, { new: true });
        } catch (error) {
            throw new Error(`Error updating user: ${error.message}`);
        }
    }

    async delete(id) {
        try {
            return await UserModel.findByIdAndDelete(id);
        } catch (error) {
            throw new Error(`Error deleting user: ${error.message}`);
        }
    }

    async validatePassword(user, password) {
        try {
            return await bcrypt.compare(password, user.password);
        } catch (error) {
            throw new Error(`Error validating password: ${error.message}`);
        }
    }
}

export default UserDBManager;
