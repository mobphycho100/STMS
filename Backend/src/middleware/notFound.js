module.exports = (req, res) => {
    return res.status(404).json({ success: false, data: null, error: { message: 'Route not found' } });
};
