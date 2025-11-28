const { sendSuccess, sendError } = require('../utils/response');
const { schedule } = require('../services/aiSchedulerService');

async function createSchedule(req, res, next) {
    try {
        const { userId } = req.body;
        if (userId !== req.user.id && req.user.role !== 'ADMIN') {
            return sendError(res, 'Forbidden', 403);
        }
        // TODO: Integrate real LLM in aiSchedulerService; current implementation uses a heuristic algorithm.
        const out = schedule(req.body);
        return sendSuccess(res, out);
    } catch (err) {
        next(err);
    }
}

module.exports = { createSchedule };
