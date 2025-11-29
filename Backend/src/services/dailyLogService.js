const DailyLog = require('../models/DailyLog');
const Task = require('../models/Task');
const { TaskStatus, ReviewStatus, Attendance, TaskType } = require('../utils/constants');

function normalizeTasks(tasks = []) {
    return tasks.map((t) => {
        const status = t.status;
        const isNotDone = status === TaskStatus.NOT_DONE;
        return {
            taskId: t.taskId,
            type: t.type,
            status,
            reasonForNonCompletion: isNotDone ? t.reasonForNonCompletion || '' : null,
            reviewStatus: isNotDone ? ReviewStatus.PENDING : ReviewStatus.PENDING,
            reviewComment: null,
        };
    });
}

async function upsertDailyLog(userId, payload) {
    // Ensure date is in YYYY-MM-DD format and normalize it
    const date = new Date(payload.date).toISOString().split('T')[0];

    const update = {
        $set: {
            practiceSessionCount: payload.practiceSessionCount ?? 0,
            doubtsLoggedCount: payload.doubtsLoggedCount ?? 0,
            conceptExplanationCount: payload.conceptExplanationCount ?? 0,
            standupAttendance: payload.standupAttendance ?? Attendance.ABSENT,
            syncupAttendance: payload.syncupAttendance ?? Attendance.ABSENT,
            updatedAt: new Date()
        },
        $setOnInsert: {
            userId,
            date,
            createdAt: new Date()
        }
    };

    // Metrics update must not change tasks. Ignore any tasks passed here.

    // Use findOneAndUpdate with upsert to ensure atomic updates
    const log = await DailyLog.findOneAndUpdate(
        { userId, date },
        update,
        {
            upsert: true,
            new: true,
            runValidators: true
        }
    );

    return log;
}

async function getDailyLog(userId, date) {
    // Normalize date to YYYY-MM-DD format for consistent querying
    const normalizedDate = new Date(date).toISOString().split('T')[0];
    const log = await DailyLog.findOne({ userId, date: normalizedDate })
        .populate({ path: 'tasks.taskId', select: 'title category priority plannedTime actualTime' })
        .lean();
    if (!log) return log;
    const tasks = (log.tasks || []).map((t) => {
        const taskDoc = t.taskId && typeof t.taskId === 'object' && t.taskId !== null ? t.taskId : null;
        return {
            taskId: taskDoc && taskDoc._id ? String(taskDoc._id) : String(t.taskId),
            type: t.type,
            status: t.status,
            reasonForNonCompletion: t.reasonForNonCompletion,
            reviewStatus: t.reviewStatus,
            reviewComment: t.reviewComment,
            title: taskDoc?.title || '',
            category: taskDoc?.category || '',
            priority: taskDoc?.priority || '',
            plannedTime: taskDoc?.plannedTime || '',
            actualTime: taskDoc?.actualTime || '',
        };
    });
    return { ...log, tasks };
}

async function patchTaskStatus(userId, dailyLogId, taskId, { status, reasonForNonCompletion }) {
    const isNotDone = status === TaskStatus.NOT_DONE;
    const setUpdate = {
        'tasks.$[elem].status': status,
        'tasks.$[elem].reasonForNonCompletion': isNotDone ? (reasonForNonCompletion || '') : null,
        'tasks.$[elem].reviewStatus': ReviewStatus.PENDING,
        'tasks.$[elem].reviewComment': null,
    };

    // Try to update if the task is already present
    let updated = await DailyLog.findOneAndUpdate(
        { _id: dailyLogId, userId },
        { $set: setUpdate },
        { new: true, arrayFilters: [{ 'elem.taskId': taskId }] }
    );

    // If not present, insert a new entry
    if (!updated || !Array.isArray(updated.tasks) || !updated.tasks.some(t => String(t.taskId) === String(taskId))) {
        // Determine task type from Task collection
        const taskDoc = await Task.findById(taskId, { type: 1 }).lean();
        const type = taskDoc?.type || TaskType.DEFAULT;
        const pushElem = {
            taskId,
            type,
            status,
            reasonForNonCompletion: isNotDone ? (reasonForNonCompletion || '') : null,
            reviewStatus: ReviewStatus.PENDING,
            reviewComment: null,
        };
        updated = await DailyLog.findOneAndUpdate(
            { _id: dailyLogId, userId },
            { $push: { tasks: pushElem } },
            { new: true }
        );
    }

    return updated;
}

module.exports = { upsertDailyLog, getDailyLog, patchTaskStatus };
