const { sendError } = require('../utils/response');

module.exports = (schema, property = 'body') => (req, res, next) => {
    const { error, value } = schema.validate(req[property], {
        abortEarly: false,
        stripUnknown: true,
        convert: true,
    });
    if (error) {
        return sendError(
            res,
            'Validation error',
            400,
            error.details.map((d) => d.message)
        );
    }
    req[property] = value;
    next();
};
