const Joi = require('joi');
const { TaskType } = require('../utils/constants');

const objectId = () => Joi.string().hex().length(24);

const defaultTaskCreateSchema = Joi.object({
    title: Joi.string().min(2).max(200).required(),
    description: Joi.string().allow('', null),
    category: Joi.string().allow('', null),
    isActive: Joi.boolean().optional(),
});

const defaultTaskUpdateSchema = Joi.object({
    title: Joi.string().min(2).max(200).optional(),
    description: Joi.string().allow('', null),
    category: Joi.string().allow('', null),
    isActive: Joi.boolean().optional(),
});

const defaultTaskListQuerySchema = Joi.object({
    active: Joi.boolean().truthy('true').falsy('false').optional(),
});

const customTaskCreateSchema = Joi.object({
    title: Joi.string().min(2).max(200).required(),
    description: Joi.string().allow('', null),
    category: Joi.string().allow('', null),
    priority: Joi.string().valid('Highest', 'High', 'Medium', 'Low', 'Adhoc').optional(),
    status: Joi.string().valid('Completed', 'Not Done', 'Yet to Start', 'On Hold', 'In Progress', 'Carry Forward').optional(),
    plannedTime: Joi.string().pattern(/^\d{1,2}:\d{2}$/).optional(),
    actualTime: Joi.string().pattern(/^\d{1,2}:\d{2}$/).optional(),
    remarks: Joi.string().allow('', null).optional(),
    assignedTo: objectId().optional(),
});

const customTaskUpdateSchema = Joi.object({
    title: Joi.string().min(2).max(200).optional(),
    description: Joi.string().allow('', null),
    category: Joi.string().allow('', null),
    priority: Joi.string().valid('Highest', 'High', 'Medium', 'Low', 'Adhoc').optional(),
    status: Joi.string().valid('Completed', 'Not Done', 'Yet to Start', 'On Hold', 'In Progress', 'Carry Forward').optional(),
    plannedTime: Joi.string().pattern(/^\d{1,2}:\d{2}$/).optional(),
    actualTime: Joi.string().pattern(/^\d{1,2}:\d{2}$/).optional(),
    remarks: Joi.string().allow('', null).optional(),
    assignedTo: objectId().optional(),
});

const customTaskIdParam = Joi.object({ id: objectId().required() });

module.exports = {
    defaultTaskCreateSchema,
    defaultTaskUpdateSchema,
    defaultTaskListQuerySchema,
    customTaskCreateSchema,
    customTaskUpdateSchema,
    customTaskIdParam,
    objectId,
    TaskType,
};
