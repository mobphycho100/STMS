const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const roles = require('../middleware/roles');
const validate = require('../middleware/validate');
const techController = require('../controllers/techController');
const { createTechnologySchema, updateTechnologySchema, techIdParam } = require('../validation/techSchemas');

// Only require auth for POST/PUT, not GET
router.get('/', techController.list);
router.use(auth);
router.post('/', roles('ADMIN'), validate(createTechnologySchema), techController.create);
router.put('/:id', roles('ADMIN'), validate(techIdParam, 'params'), validate(updateTechnologySchema), techController.update);

module.exports = router;
