const Task = require('../models/Task');
const { TaskType } = require('../utils/constants');

async function createDefaultTask(adminId, data) {
    const task = await Task.create({ ...data, type: TaskType.DEFAULT, createdBy: adminId });
    return task;
}

async function listDefaultTasks({ active }) {
    const filter = { type: TaskType.DEFAULT };
    if (typeof active === 'boolean') filter.isActive = active;
    return Task.find(filter).sort({ createdAt: -1 });
}

async function updateDefaultTask(id, data) {
    const task = await Task.findOneAndUpdate({ _id: id, type: TaskType.DEFAULT }, data, {
        new: true,
    });
    return task;
}

async function setDefaultTaskActive(id, isActive) {
    const task = await Task.findOneAndUpdate(
        { _id: id, type: TaskType.DEFAULT },
        { isActive },
        { new: true }
    );
    return task;
}

async function createCustomTask(userId, data, isAdmin = false) {
    const payload = { ...data, type: TaskType.CUSTOM, createdBy: userId };
    if (!isAdmin) delete payload.assignedTo;
    const task = await Task.create(payload);
    return task;
}

async function listCustomTasks(userId) {
    return Task.find({ type: TaskType.CUSTOM, $or: [{ createdBy: userId }, { assignedTo: userId }] }).sort({ createdAt: -1 });
}

async function updateCustomTask(userId, id, data, isAdmin = false) {
    // Build the update object with only allowed fields
    const update = {};
    const allowedFields = [
        'title', 'description', 'category', 'status', 'priority',
        'plannedTime', 'actualTime', 'remarks', 'assignedTo', 'date'
    ];

    // Only include fields that exist in the data and are in allowedFields
    allowedFields.forEach(field => {
        if (data[field] !== undefined) {
            update[field] = data[field];
        }
    });

    // For non-admin users, ensure they can only update specific fields if they're not the owner
    if (!isAdmin) {
        // Check if user is the creator or the assignee
        const task = await Task.findOne({ _id: id, type: TaskType.CUSTOM });
        if (!task) return null;

        const isCreator = String(task.createdBy) === String(userId);
        const isAssignee = task.assignedTo && String(task.assignedTo) === String(userId);

        // If user is neither creator nor assignee, they can't update
        if (!isCreator && !isAssignee) return null;

        // If user is assignee but not creator, restrict to status, actualTime, and remarks only
        if (!isCreator && isAssignee) {
            const restrictedUpdate = {};
            ['status', 'actualTime', 'remarks'].forEach(field => {
                if (update[field] !== undefined) {
                    restrictedUpdate[field] = update[field];
                }
            });

            // Only proceed if there are allowed fields to update
            if (Object.keys(restrictedUpdate).length === 0) return null;

            // Update only the restricted fields
            const updatedTask = await Task.findOneAndUpdate(
                {
                    _id: id, type: TaskType.CUSTOM, $or: [
                        { createdBy: userId },
                        { assignedTo: userId }
                    ]
                },
                { $set: restrictedUpdate },
                { new: true, runValidators: true }
            );
            return updatedTask;
        }
    }

    // For admins or creators, update all allowed fields
    const filter = isAdmin
        ? { _id: id, type: TaskType.CUSTOM }
        : { _id: id, type: TaskType.CUSTOM, createdBy: userId };

    const updatedTask = await Task.findOneAndUpdate(
        filter,
        { $set: update },
        { new: true, runValidators: true }
    );

    return updatedTask;
}

async function deleteCustomTask(userId, id, isAdmin = false) {
    const filter = isAdmin
        ? { _id: id, type: TaskType.CUSTOM }
        : { _id: id, type: TaskType.CUSTOM, createdBy: userId };
    const res = await Task.deleteOne(filter);
    return res.deletedCount > 0;
}

module.exports = {
    createDefaultTask,
    listDefaultTasks,
    updateDefaultTask,
    setDefaultTaskActive,
    createCustomTask,
    listCustomTasks,
    updateCustomTask,
    deleteCustomTask,
};
