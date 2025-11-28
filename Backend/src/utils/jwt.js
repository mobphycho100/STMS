const jwt = require('jsonwebtoken');
const env = require('../config/env');

function signAccessToken(payload, options = {}) {
    return jwt.sign(payload, env.accessTokenSecret, {
        expiresIn: env.accessTokenExpiresIn,
        ...options,
    });
}

function signRefreshToken(payload, options = {}) {
    return jwt.sign(payload, env.refreshTokenSecret, {
        expiresIn: env.refreshTokenExpiresIn,
        ...options,
    });
}

function verifyAccessToken(token) {
    return jwt.verify(token, env.accessTokenSecret);
}

function verifyRefreshToken(token) {
    return jwt.verify(token, env.refreshTokenSecret);
}

module.exports = {
    signAccessToken,
    signRefreshToken,
    verifyAccessToken,
    verifyRefreshToken,
};
