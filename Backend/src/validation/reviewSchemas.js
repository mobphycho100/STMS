const Joi = require('joi');
const { objectId } = require('./taskSchemas');

const pendingQuerySchema = Joi.object({
    userId: objectId().optional(),
    date: Joi.string().pattern(/^\d{4}-\d{2}-\d{2}$/).optional(),
});

const reviewActionParamsSchema = Joi.object({
    dailyLogId: objectId().required(),
    taskId: objectId().required(),
});

const reviewActionBodySchema = Joi.object({
    comment: Joi.string().allow('', null).max(500).optional(),
});

const reviewTaskParamsSchema = Joi.object({
    taskId: objectId().required(),
});

module.exports = {
    pendingQuerySchema,
    reviewActionParamsSchema,
    reviewActionBodySchema,
    reviewTaskParamsSchema,
};
