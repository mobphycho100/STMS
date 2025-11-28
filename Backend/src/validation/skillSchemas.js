const Joi = require('joi');
const { objectId } = require('./taskSchemas');

const getProgressQuery = Joi.object({
    userId: objectId().optional(),
    technologyId: objectId().required(),
});

const ackBody = Joi.object({
    technologyId: objectId().required(),
    topicId: objectId().required(),
});

module.exports = { getProgressQuery, ackBody };
