const Joi = require('joi');
const { objectId } = require('./taskSchemas');

const topicInput = Joi.object({
    title: Joi.string().min(2).max(200).required(),
});

const createTechnologySchema = Joi.object({
    name: Joi.string().min(2).max(100).required(),
    description: Joi.string().allow('', null),
    topics: Joi.array().items(topicInput).default([]),
});

const updateTechnologySchema = Joi.object({
    name: Joi.string().min(2).max(100).optional(),
    description: Joi.string().allow('', null),
    topics: Joi.array().items(topicInput).optional(),
});

const techIdParam = Joi.object({ id: objectId().required() });

module.exports = {
    createTechnologySchema,
    updateTechnologySchema,
    techIdParam,
};
