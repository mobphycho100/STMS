const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const validate = require('../middleware/validate');
const { getProgressQuery, ackBody } = require('../validation/skillSchemas');
const controller = require('../controllers/skillProgressController');

// Require auth for GET so progress is loaded for the logged-in user
router.get('/progress', auth, validate(getProgressQuery, 'query'), controller.getProgress);
router.use(auth);
router.post('/progress/ack', validate(ackBody), controller.ack);
router.post('/progress/unack', validate(ackBody), controller.unack);

module.exports = router;
