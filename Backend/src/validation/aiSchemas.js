const Joi = require('joi');
const { objectId } = require('./taskSchemas');

const daySchema = Joi.object({ date: Joi.string().pattern(/^\d{4}-\d{2}-\d{2}$/).required() });
const weekSchema = Joi.object({
    startDate: Joi.string().pattern(/^\d{4}-\d{2}-\d{2}$/).required(),
    endDate: Joi.string().pattern(/^\d{4}-\d{2}-\d{2}$/).required(),
});

const pendingTaskSchema = Joi.object({
    id: objectId().optional(),
    title: Joi.string().min(2).max(200).required(),
    type: Joi.string().valid('DEFAULT', 'CUSTOM').required(),
    estimatedMinutes: Joi.number().integer().min(10).max(240).default(30),
});

const topicSchema = Joi.object({
    topicId: objectId().optional(),
    title: Joi.string().min(2).max(200).required(),
    estimatedMinutes: Joi.number().integer().min(10).max(180).default(30),
});

const scheduleInputSchema = Joi.object({
    userId: objectId().required(),
    day: daySchema.optional(),
    week: weekSchema.optional(),
    pendingTasks: Joi.array().items(pendingTaskSchema).default([]),
    skillTopics: Joi.array().items(topicSchema).default([]),
    availableMinutes: Joi.number().integer().min(30).max(12 * 60).required(),
}).xor('day', 'week');

module.exports = { scheduleInputSchema };
