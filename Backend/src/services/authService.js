const bcrypt = require('bcrypt');
const User = require('../models/User');
const env = require('../config/env');

const SALT_ROUNDS = 10;

async function signup({ name, email, password, role, secretKey }) {
    const existing = await User.findOne({ email });
    if (existing) {
        const err = new Error('Email already in use');
        err.code = 'EMAIL_IN_USE';
        throw err;
    }
    if (role === 'ADMIN') {
        if (!env.adminSecretKey || secretKey !== env.adminSecretKey) {
            const err = new Error('Invalid admin secret');
            err.code = 'INVALID_ADMIN_SECRET';
            throw err;
        }
    }
    const hash = await bcrypt.hash(password, SALT_ROUNDS);
    const user = await User.create({ name, email, password: hash, role });
    return user;
}

async function login({ email, password }) {
    const user = await User.findOne({ email });
    if (!user) {
        const err = new Error('Invalid credentials');
        err.code = 'INVALID_CREDENTIALS';
        throw err;
    }
    const ok = await bcrypt.compare(password, user.password);
    if (!ok) {
        const err = new Error('Invalid credentials');
        err.code = 'INVALID_CREDENTIALS';
        throw err;
    }
    return user;
}

function toPublicUser(user) {
    return {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt,
    };
}

module.exports = { signup, login, toPublicUser };
