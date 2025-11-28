const Joi = require('joi');
const { objectId } = require('./taskSchemas');

const generateBodySchema = Joi.object({
    month: Joi.string().pattern(/^\d{4}-\d{2}$/).required(), // YYYY-MM
    userId: objectId().optional(), // admin may generate for a user
});

const getQuerySchema = Joi.object({
    userId: objectId().optional(),
    month: Joi.string().pattern(/^\d{4}-\d{2}$/).required(),
});

module.exports = { generateBodySchema, getQuerySchema };
