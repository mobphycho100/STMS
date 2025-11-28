const { sendSuccess, sendError } = require('../utils/response');
const reportService = require('../services/reportService');

async function generate(req, res, next) {
    try {
        const { month, userId } = req.body;
        const targetUserId = userId || req.user.id;
        if (userId && userId !== req.user.id && req.user.role !== 'ADMIN') {
            return sendError(res, 'Forbidden', 403);
        }
        const report = await reportService.generateMonthlyReport(targetUserId, month);
        return sendSuccess(res, report, 201);
    } catch (err) {
        next(err);
    }
}

async function getOne(req, res, next) {
    try {
        const { month, userId } = req.query;
        const targetUserId = userId || req.user.id;
        if (userId && userId !== req.user.id && req.user.role !== 'ADMIN') {
            return sendError(res, 'Forbidden', 403);
        }
        const report = await reportService.getMonthlyReport(targetUserId, month);
        return sendSuccess(res, report);
    } catch (err) {
        next(err);
    }
}

module.exports = { generate, getOne };
