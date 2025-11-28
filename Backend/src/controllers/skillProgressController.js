const { sendSuccess, sendError } = require('../utils/response');
const skillService = require('../services/skillProgressService');

async function getProgress(req, res, next) {
    try {
        // Use userId from query if provided, else use req.user.id if authenticated, else null
        let userId = req.query.userId;
        if (!userId && req.user && req.user.id) userId = req.user.id;
        // If no userId, just return all topics with acknowledged=false
        const data = await skillService.getProgress(userId, req.query.technologyId);
        return sendSuccess(res, data);
    } catch (err) {
        next(err);
    }
}

async function ack(req, res, next) {
    try {
        const { technologyId, topicId } = req.body;
        console.log('ACK BODY:', req.body);
        console.log('ACK:', { userId: req.user?.id, technologyId, topicId });
        const data = await skillService.ackTopic(req.user.id, technologyId, topicId);
        return sendSuccess(res, data);
    } catch (err) {
        if (err.isJoi) {
            return sendError(res, err.message, 400);
        }
        next(err);
    }
}

async function unack(req, res, next) {
    try {
        const { technologyId, topicId } = req.body;
        console.log('UNACK BODY:', req.body);
        console.log('UNACK:', { userId: req.user?.id, technologyId, topicId });
        const data = await skillService.unackTopic(req.user.id, technologyId, topicId);
        return sendSuccess(res, data);
    } catch (err) {
        if (err.isJoi) {
            return sendError(res, err.message, 400);
        }
        next(err);
    }
}

module.exports = { getProgress, ack, unack };
