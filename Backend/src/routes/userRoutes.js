const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const roles = require('../middleware/roles');
const validate = require('../middleware/validate');
const controller = require('../controllers/userController');
const { listUsersQuerySchema } = require('../validation/userSchemas');

router.use(auth, roles('ADMIN'));

router.get('/', validate(listUsersQuerySchema, 'query'), controller.list);

module.exports = router;
