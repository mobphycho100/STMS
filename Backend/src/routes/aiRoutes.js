const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const validate = require('../middleware/validate');
const { scheduleInputSchema } = require('../validation/aiSchemas');
const controller = require('../controllers/aiController');

router.use(auth);

router.post('/schedule', validate(scheduleInputSchema), controller.createSchedule);

module.exports = router;
