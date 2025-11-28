const { sendSuccess, sendError } = require('../utils/response');
const taskService = require('../services/taskService');
const Task = require('../models/Task');

// ADMIN: Default tasks
async function createDefault(req, res, next) {
    try {
        const task = await taskService.createDefaultTask(req.user.id, req.body);
        return sendSuccess(res, task, 201);
    } catch (err) {
        next(err);
    }
}

async function listDefault(req, res, next) {
    try {
        const { active } = req.query; // already boolean or undefined via Joi
        const tasks = await taskService.listDefaultTasks({ active });
        return sendSuccess(res, tasks);
    } catch (err) {
        next(err);
    }
}

async function updateDefault(req, res, next) {
    try {
        const task = await taskService.updateDefaultTask(req.params.id, req.body);
        if (!task) return sendError(res, 'Task not found', 404);
        return sendSuccess(res, task);
    } catch (err) {
        next(err);
    }
}

async function activateDefault(req, res, next) {
    try {
        const task = await taskService.setDefaultTaskActive(req.params.id, true);
        if (!task) return sendError(res, 'Task not found', 404);
        return sendSuccess(res, task);
    } catch (err) {
        next(err);
    }
}

async function deactivateDefault(req, res, next) {
    try {
        const task = await taskService.setDefaultTaskActive(req.params.id, false);
        if (!task) return sendError(res, 'Task not found', 404);
        return sendSuccess(res, task);
    } catch (err) {
        next(err);
    }
}

// USER: Custom tasks
async function createCustom(req, res, next) {
    try {
        // Admin can create tasks for any user using assignedTo
        const isAdmin = req.user.role === 'ADMIN';
        const task = await taskService.createCustomTask(req.user.id, req.body, isAdmin);
        return sendSuccess(res, task, 201);
    } catch (err) {
        next(err);
    }
}

async function listCustom(req, res, next) {
    try {
        const tasks = await taskService.listCustomTasks(req.user.id);
        return sendSuccess(res, tasks);
    } catch (err) {
        next(err);
    }
}

async function updateCustom(req, res, next) {
    try {
        const isAdmin = req.user.role === 'ADMIN';
        if (isAdmin) {
            const task = await taskService.updateCustomTask(req.user.id, req.params.id, req.body, true);
            if (!task) return sendError(res, 'Task not found', 404);
            return sendSuccess(res, task);
        }
        // Non-admin: allow update if task is created by user (full), or assigned to user (restricted)
        const current = await Task.findById(req.params.id);
        if (!current || String(current.type) !== 'CUSTOM') return sendError(res, 'Task not found', 404);
        if (String(current.createdBy) === String(req.user.id)) {
            const task = await taskService.updateCustomTask(req.user.id, req.params.id, req.body, false);
            if (!task) return sendError(res, 'Task not found', 404);
            return sendSuccess(res, task);
        }
        if (current.assignedTo && String(current.assignedTo) === String(req.user.id)) {
            // Restrict to status, actualTime, remarks
            const { status, actualTime, remarks } = req.body || {};
            const payload = {};
            if (status !== undefined) payload.status = status;
            if (actualTime !== undefined) payload.actualTime = actualTime;
            if (remarks !== undefined) payload.remarks = remarks;
            const updated = await Task.findOneAndUpdate(
                { _id: req.params.id, type: 'CUSTOM', assignedTo: req.user.id },
                { $set: payload },
                { new: true }
            );
            if (!updated) return sendError(res, 'Task not found', 404);
            return sendSuccess(res, updated);
        }
    } catch (err) {
        // Handle validation errors specifically
        if (err.name === 'ValidationError') {
            const errors = Object.values(err.errors).map(e => e.message);
            return sendError(res, `Validation error: ${errors.join(', ')}`, 400);
        }
        next(err);
    }
}

async function deleteCustom(req, res, next) {
    try {
        const ok = await taskService.deleteCustomTask(req.user.id, req.params.id, req.user.role === 'ADMIN');
        if (!ok) return sendError(res, 'Task not found', 404);
        return sendSuccess(res, { deleted: true });
    } catch (err) {
        next(err);
    }
}

module.exports = {
    createDefault,
    listDefault,
    updateDefault,
    activateDefault,
    deactivateDefault,
    createCustom,
    listCustom,
    updateCustom,
    deleteCustom,
};
