const dotenv = require('dotenv');
dotenv.config();

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
    corsOrigin: process.env.CORS_ORIGIN || 'https://stms-indol.vercel.app/',
    adminSignupSecret: process.env.ADMIN_SIGNUP_SECRET || '',
    adminSecretKey: process.env.ADMIN_SECRET_KEY || '',
};

if (!env.mongoUri) throw new Error('MONGO_URI not set');
if (!env.jwtSecret) throw new Error('JWT_SECRET not set');

module.exports = env;
