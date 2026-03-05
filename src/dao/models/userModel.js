import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
    first_name: {
        type: String,
        required: true
    },
    last_name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true
    },
    password: {
        type: String,
        required: true
    },
    age: {
        type: Number
    },
    role: {
        type: String,
        default: 'user'
    },
    resetPasswordToken: {
        type: String
    },
    resetPasswordExpires: {
        type: Date
    }
}, {
    timestamps: true
});

export default mongoose.model('users', userSchema);