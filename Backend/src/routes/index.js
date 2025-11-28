const express = require('express');
const router = express.Router();

router.use('/auth', require('./authRoutes'));
router.use('/tasks', require('./taskRoutes'));
router.use('/daily-logs', require('./dailyLogRoutes'));
router.use('/reviews', require('./reviewRoutes'));
router.use('/tech', require('./techRoutes'));
router.use('/skills', require('./skillRoutes'));
router.use('/reports', require('./reportRoutes'));
router.use('/ai', require('./aiRoutes'));
router.use('/users', require('./userRoutes'));

module.exports = router;
