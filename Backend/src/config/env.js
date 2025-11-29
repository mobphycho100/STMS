const dotenv = require('dotenv');
dotenv.config();

function normalizeOrigins(val) {
    if (!val) return [];
    return val
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean)
        .map((s) => s.replace(/\/$/, ''));
}

const env = {
    port: process.env.PORT || 5000,
    mongoUri: process.env.MONGO_URI,
    jwtSecret: process.env.JWT_SECRET,
    jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
    accessTokenSecret: process.env.ACCESS_TOKEN_SECRET || process.env.JWT_SECRET,
    accessTokenExpiresIn: process.env.ACCESS_TOKEN_EXPIRES_IN || '7d',
    refreshTokenSecret: process.env.REFRESH_TOKEN_SECRET || process.env.JWT_SECRET,
    refreshTokenExpiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN || '7d',
    nodeEnv: process.env.NODE_ENV || 'development',
    // Allow multiple origins via comma-separated list; strip any trailing slash to satisfy strict CORS match
    corsOrigin: normalizeOrigins(process.env.CORS_ORIGIN || 'http://localhost:5173,https://stms-indol.vercel.app'),
    adminSignupSecret: process.env.ADMIN_SIGNUP_SECRET || '',
    adminSecretKey: process.env.ADMIN_SECRET_KEY || '',
};

if (!env.mongoUri) throw new Error('MONGO_URI not set');
if (!env.jwtSecret) throw new Error('JWT_SECRET not set');

module.exports = env;
