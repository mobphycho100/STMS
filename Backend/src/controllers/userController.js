const { sendSuccess } = require('../utils/response');
const userService = require('../services/userService');

async function list(req, res, next) {
    try {
        const { month } = req.query;
        const items = await userService.listWithCompliance(month);
        return sendSuccess(res, items);
    } catch (err) {
        next(err);
    }
}

module.exports = { list };
