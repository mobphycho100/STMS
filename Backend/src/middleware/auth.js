const { sendError } = require('../utils/response');
const { verifyAccessToken } = require('../utils/jwt');

module.exports = (req, res, next) => {
    const token = req.cookies?.jwt;
    if (!token) return sendError(res, 'Unauthorized', 401);
    try {
        const payload = verifyAccessToken(token);
        req.user = { id: payload.id, role: payload.role, name: payload.name };
        next();
    } catch (e) {
        return sendError(res, 'Invalid or expired token', 401);
    }
};
