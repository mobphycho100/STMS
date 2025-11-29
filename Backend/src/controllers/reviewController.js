const { sendSuccess, sendError } = require('../utils/response');
const reviewService = require('../services/reviewService');
const { ReviewStatus } = require('../utils/constants');

async function listPending(req, res, next) {
    try {
        const { userId, date } = req.query;
        const items = await reviewService.listPending({ userId, date });
        return sendSuccess(res, items);
    } catch (err) {
        next(err);
    }
}

async function approve(req, res, next) {
    try {
        const { dailyLogId, taskId } = req.params;
        const { comment } = req.body;
        const log = await reviewService.setReviewStatus(dailyLogId, taskId, ReviewStatus.APPROVED, comment);
        if (!log) return sendError(res, 'Daily log or task not found', 404);
        return sendSuccess(res, log);
    } catch (err) {
        next(err);
    }
}

async function reject(req, res, next) {
    try {
        const { dailyLogId, taskId } = req.params;
        const { comment } = req.body;
        const log = await reviewService.setReviewStatus(dailyLogId, taskId, ReviewStatus.REJECTED, comment);
        if (!log) return sendError(res, 'Daily log or task not found', 404);
        return sendSuccess(res, log);
    } catch (err) {
        next(err);
    }
}

// Task-level approve/reject (source of truth: tasks collection)
async function approveTask(req, res, next) {
    try {
        const { taskId } = req.params;
        const { comment } = req.body;
        const task = await reviewService.setTaskReviewStatus(taskId, ReviewStatus.APPROVED, comment);
        if (!task) return sendError(res, 'Task not found', 404);
        return sendSuccess(res, task);
    } catch (err) {
        next(err);
    }
}

async function rejectTask(req, res, next) {
    try {
        const { taskId } = req.params;
        const { comment } = req.body;
        const task = await reviewService.setTaskReviewStatus(taskId, ReviewStatus.REJECTED, comment);
        if (!task) return sendError(res, 'Task not found', 404);
        return sendSuccess(res, task);
    } catch (err) {
        next(err);
    }
}

module.exports = { listPending, approve, reject, approveTask, rejectTask };
