const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const validate = require('../middleware/validate');
const dailyLogController = require('../controllers/dailyLogController');
const {
    upsertDailyLogSchema,
    getDailyLogQuerySchema,
    patchTaskParamSchema,
    patchTaskBodySchema,
} = require('../validation/dailyLogSchemas');

router.use(auth);

router.put('/', validate(upsertDailyLogSchema), dailyLogController.upsert);
router.get('/', validate(getDailyLogQuerySchema, 'query'), dailyLogController.getOne);
router.patch(
    '/:id/tasks/:taskId',
    validate(patchTaskParamSchema, 'params'),
    validate(patchTaskBodySchema),
    dailyLogController.patchTask
);

module.exports = router;
