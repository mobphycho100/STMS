function sendSuccess(res, data, status = 200) {
    return res.status(status).json({ success: true, data, error: null });
}

function sendError(res, message, status = 400, details = null) {
    const error = details ? { message, details } : { message };
    return res.status(status).json({ success: false, data: null, error });
}

module.exports = { sendSuccess, sendError };
