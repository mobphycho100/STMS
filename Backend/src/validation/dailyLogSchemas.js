const Joi = require('joi');
const { TaskStatus, TaskType, Attendance } = require('../utils/constants');
const { objectId } = require('./taskSchemas');

const dailyTaskSchema = Joi.object({
    taskId: objectId().required(),
    type: Joi.string()
        .valid(...Object.values(TaskType))
        .required(),
    status: Joi.string()
        .valid(...Object.values(TaskStatus))
        .required(),
    reasonForNonCompletion: Joi.when('status', {
        is: 'NOT_DONE',
        then: Joi.string().min(3).required(),
        otherwise: Joi.string().allow(null, '').optional(),
    }),
});

const upsertDailyLogSchema = Joi.object({
    date: Joi.string().pattern(/^\d{4}-\d{2}-\d{2}$/).required(),
    practiceSessionCount: Joi.number().integer().min(0).default(0),
    doubtsLoggedCount: Joi.number().integer().min(0).default(0),
    conceptExplanationCount: Joi.number().integer().min(0).default(0),
    standupAttendance: Joi.string().valid('PRESENT', 'ABSENT').default('ABSENT'),
    syncupAttendance: Joi.string().valid('PRESENT', 'ABSENT').default('ABSENT'),
    tasks: Joi.array().items(dailyTaskSchema).optional(),
});

const getDailyLogQuerySchema = Joi.object({
    userId: objectId().optional(),
    date: Joi.string().pattern(/^\d{4}-\d{2}-\d{2}$/).required(),
});

const patchTaskParamSchema = Joi.object({
    id: objectId().required(),
    taskId: objectId().required(),
});

const patchTaskBodySchema = Joi.object({
    status: Joi.string()
        .valid(...Object.values(TaskStatus))
        .required(),
    reasonForNonCompletion: Joi.when('status', {
        is: 'NOT_DONE',
        then: Joi.string().min(3).required(),
        otherwise: Joi.string().allow(null, '').optional(),
    }),
});

module.exports = {
    upsertDailyLogSchema,
    getDailyLogQuerySchema,
    patchTaskParamSchema,
    patchTaskBodySchema,
};
