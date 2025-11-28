const express = require('express');
const router = express.Router();
const validate = require('../middleware/validate');
const { signupSchema, loginSchema } = require('../validation/authSchemas');
const authController = require('../controllers/authController');

router.post('/signup', validate(signupSchema), authController.signup);
router.post('/login', validate(loginSchema), authController.login);
router.get('/me', authController.me);
router.post('/logout', authController.logout);

module.exports = router;
