const { sendSuccess, sendError } = require('../utils/response');
const authService = require('../services/authService');
const { signAccessToken, verifyAccessToken } = require('../utils/jwt');
const User = require('../models/User');
const env = require('../config/env');

const ACCESS_COOKIE_NAME = 'jwt';
const isProd = env.nodeEnv === 'production';
const cookieOptions = {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? 'none' : 'lax',
    path: '/',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
};

async function signup(req, res, next) {
    try {
        const user = await authService.signup(req.body);
        const token = signAccessToken({ id: user._id, role: user.role, name: user.name });
        res.cookie(ACCESS_COOKIE_NAME, token, cookieOptions);
        return sendSuccess(res, { user: authService.toPublicUser(user) }, 201);
    } catch (err) {
        if (err.code === 'EMAIL_IN_USE') return sendError(res, 'Email already in use', 409);
        if (err.code === 'INVALID_ADMIN_SECRET') return sendError(res, 'Invalid admin secret', 403);
        next(err);
    }
}

async function login(req, res, next) {
    try {
        const user = await authService.login(req.body);
        const token = signAccessToken({ id: user._id, role: user.role, name: user.name });
        res.cookie(ACCESS_COOKIE_NAME, token, cookieOptions);
        return sendSuccess(res, { user: authService.toPublicUser(user) });
    } catch (err) {
        if (err.code === 'INVALID_CREDENTIALS') return sendError(res, 'Invalid credentials', 401);
        if (err.code === 'INVALID_ADMIN_SECRET') return sendError(res, 'Invalid admin secret', 403);
        next(err);
    }
}

async function me(req, res) {
    const token = req.cookies?.[ACCESS_COOKIE_NAME];
    if (!token) return sendError(res, 'Unauthorized', 401);
    try {
        const payload = verifyAccessToken(token);
        const user = await User.findById(payload.id);
        if (!user) return sendError(res, 'Unauthorized', 401);
        return sendSuccess(res, { user: authService.toPublicUser(user) });
    } catch (e) {
        return sendError(res, 'Unauthorized', 401);
    }
}

async function logout(_req, res) {
    res.clearCookie(ACCESS_COOKIE_NAME, cookieOptions);
    return sendSuccess(res, { message: 'Logged out' });
}

module.exports = { signup, login, me, logout };
