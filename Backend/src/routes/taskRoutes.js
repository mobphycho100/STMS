const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const roles = require('../middleware/roles');
const validate = require('../middleware/validate');
const taskController = require('../controllers/taskController');
const {
    defaultTaskCreateSchema,
    defaultTaskUpdateSchema,
    defaultTaskListQuerySchema,
    customTaskCreateSchema,
    customTaskUpdateSchema,
    customTaskIdParam,
} = require('../validation/taskSchemas');

router.use(auth);

router.post(
    '/default',
    roles('ADMIN'),
    validate(defaultTaskCreateSchema),
    taskController.createDefault
);
router.get('/default', validate(defaultTaskListQuerySchema, 'query'), taskController.listDefault);
router.put(
    '/default/:id',
    roles('ADMIN'),
    validate(customTaskIdParam, 'params'),
    validate(defaultTaskUpdateSchema),
    taskController.updateDefault
);
router.patch(
    '/default/:id/activate',
    roles('ADMIN'),
    validate(customTaskIdParam, 'params'),
    taskController.activateDefault
);
router.patch(
    '/default/:id/deactivate',
    roles('ADMIN'),
    validate(customTaskIdParam, 'params'),
    taskController.deactivateDefault
);

router.post('/custom', validate(customTaskCreateSchema), taskController.createCustom);
router.get('/custom', taskController.listCustom);
router.put(
    '/custom/:id',
    validate(customTaskIdParam, 'params'),
    validate(customTaskUpdateSchema),
    taskController.updateCustom
);
router.delete('/custom/:id', validate(customTaskIdParam, 'params'), taskController.deleteCustom);

module.exports = router;
