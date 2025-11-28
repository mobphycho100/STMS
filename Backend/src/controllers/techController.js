const { sendSuccess, sendError } = require('../utils/response');
const techService = require('../services/techService');

async function list(req, res, next) {
    try {
        const items = await techService.list();
        return sendSuccess(res, items);
    } catch (err) {
        next(err);
    }
}

async function create(req, res, next) {
    try {
        const tech = await techService.create(req.body);
        return sendSuccess(res, tech, 201);
    } catch (err) {
        if (err.code === 'NAME_EXISTS') return sendError(res, 'Technology name exists', 409);
        next(err);
    }
}

async function update(req, res, next) {
    try {
        const tech = await techService.update(req.params.id, req.body);
        if (!tech) return sendError(res, 'Technology not found', 404);
        return sendSuccess(res, tech);
    } catch (err) {
        next(err);
    }
}

module.exports = { list, create, update };
