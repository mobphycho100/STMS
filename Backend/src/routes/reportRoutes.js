const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const validate = require('../middleware/validate');
const controller = require('../controllers/reportController');
const { generateBodySchema, getQuerySchema } = require('../validation/reportSchemas');

router.use(auth);

router.post('/monthly/generate', validate(generateBodySchema), controller.generate);
router.get('/monthly', validate(getQuerySchema, 'query'), controller.getOne);

module.exports = router;
