const Joi = require('joi');

const signupSchema = Joi.object({
    name: Joi.string().min(2).max(100).required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(6).max(128).required(),
    confirmPassword: Joi.string().required().valid(Joi.ref('password')).messages({
        'any.only': 'Passwords must match',
    }),
    role: Joi.string().valid('ADMIN', 'USER').required(),
    secretKey: Joi.when('role', {
        is: 'ADMIN',
        then: Joi.string().min(1).required(),
        otherwise: Joi.forbidden(),
    }),
});

const loginSchema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required(),
});

module.exports = { signupSchema, loginSchema };
