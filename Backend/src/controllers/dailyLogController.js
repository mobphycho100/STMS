const { sendSuccess, sendError } = require('../utils/response');
const dailyLogService = require('../services/dailyLogService');

async function upsert(req, res, next) {
    try {
        const log = await dailyLogService.upsertDailyLog(req.user.id, req.body);
        return sendSuccess(res, log, 201);
    } catch (err) {
        next(err);
    }
}

async function getOne(req, res, next) {
    try {
        const userId = req.query.userId || req.user.id;
        if (userId !== req.user.id && req.user.role !== 'ADMIN') {
            return sendError(res, 'Forbidden', 403);
        }
        const log = await dailyLogService.getDailyLog(userId, req.query.date);
        return sendSuccess(res, log);
    } catch (err) {
        next(err);
    }
}

async function patchTask(req, res, next) {
    try {
        const { id, taskId } = req.params;
        const log = await dailyLogService.patchTaskStatus(req.user.id, id, taskId, req.body);
        if (!log) return sendError(res, 'Daily log or task not found', 404);
        return sendSuccess(res, log);
    } catch (err) {
        next(err);
    }
}

module.exports = { upsert, getOne, patchTask };
