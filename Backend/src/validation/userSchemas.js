const Joi = require('joi');

const listUsersQuerySchema = Joi.object({
    month: Joi.string().pattern(/^\d{4}-\d{2}$/).optional(),
});

module.exports = { listUsersQuerySchema };
