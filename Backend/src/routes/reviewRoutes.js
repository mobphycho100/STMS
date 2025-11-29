const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const roles = require('../middleware/roles');
const validate = require('../middleware/validate');
const reviewController = require('../controllers/reviewController');
const {
    pendingQuerySchema,
    reviewActionParamsSchema,
    reviewActionBodySchema,
    reviewTaskParamsSchema,
} = require('../validation/reviewSchemas');

router.use(auth, roles('ADMIN'));

router.get('/pending', validate(pendingQuerySchema, 'query'), reviewController.listPending);
router.post(
    '/:dailyLogId/tasks/:taskId/approve',
    validate(reviewActionParamsSchema, 'params'),
    validate(reviewActionBodySchema),
    reviewController.approve
);
router.post(
    '/:dailyLogId/tasks/:taskId/reject',
    validate(reviewActionParamsSchema, 'params'),
    validate(reviewActionBodySchema),
    reviewController.reject
);

// Task-level review actions (source of truth: tasks collection)
router.post(
    '/tasks/:taskId/approve',
    validate(reviewTaskParamsSchema, 'params'),
    validate(reviewActionBodySchema),
    reviewController.approveTask
);
router.post(
    '/tasks/:taskId/reject',
    validate(reviewTaskParamsSchema, 'params'),
    validate(reviewActionBodySchema),
    reviewController.rejectTask
);

module.exports = router;
