const Task = require('../models/Task');
const { ReviewStatus } = require('../utils/constants');
const DailyLog = require('../models/DailyLog');

async function listPending({ userId, date }) {
    const and = [
        { status: 'Not Done' },
        { reviewStatus: 'PENDING' },
        {
            $or: [
                { reasonForNonCompletion: { $nin: [null, ''] } },
                { remarks: { $nin: [null, ''] } },
            ]
        },
    ];
    if (date) and.push({ date });
    if (userId) and.push({ $or: [{ assignedTo: userId }, { createdBy: userId }] });

    const tasks = await Task.find({ $and: and })
        .populate({ path: 'assignedTo', select: 'name' })
        .populate({ path: 'createdBy', select: 'name' })
        .sort({ date: -1, createdAt: -1 })
        .lean();

    return tasks.map((t) => {
        const userObj = t.assignedTo || t.createdBy;
        const dateStr = (t.date && String(t.date).trim())
            ? t.date
            : (t.createdAt ? new Date(t.createdAt).toISOString().slice(0, 10) : '');
        return {
            id: String(t._id),
            taskId: String(t._id),
            userId: userObj?._id ? String(userObj._id) : undefined,
            userName: userObj?.name,
            date: dateStr,
            title: t.title || '',
            category: t.category || t.type || '',
            priority: t.priority || '',
            plannedTime: t.plannedTime || '',
            actualTime: t.actualTime || '',
            reasonForNonCompletion: t.reasonForNonCompletion || t.remarks || '',
            reviewStatus: t.reviewStatus || 'PENDING',
        };
    });
}

async function setTaskReviewStatus(taskId, status, comment) {
    const update = {
        reviewStatus: status,
        reviewComment: comment || '',
    };
    const task = await Task.findOneAndUpdate({ _id: taskId }, { $set: update }, { new: true });
    return task;
}

async function setReviewStatus(dailyLogId, taskId, status, comment) {
    const update = {
        'tasks.$[elem].reviewStatus': status,
        'tasks.$[elem].reviewComment': comment || null,
    };
    const log = await DailyLog.findOneAndUpdate(
        { _id: dailyLogId },
        { $set: update },
        { new: true, arrayFilters: [{ 'elem.taskId': taskId }] }
    );
    return log;
}

module.exports = { listPending, setTaskReviewStatus, setReviewStatus };
