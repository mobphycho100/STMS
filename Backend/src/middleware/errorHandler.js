const env = require('../config/env');

module.exports = (err, _req, res, _next) => {
    console.error(err);
    const status = err.status || 500;
    return res.status(status).json({
        success: false,
        data: null,
        error: {
            message: err.message || 'Internal Server Error',
            ...(env.nodeEnv !== 'production' && { stack: err.stack }),
        },
    });
};
