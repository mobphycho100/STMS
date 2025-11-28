const DailyLog = require('../models/DailyLog');
const { TaskStatus, ReviewStatus } = require('../utils/constants');

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
            standupAttendance: payload.standupAttendance ?? false,
            syncupAttendance: payload.syncupAttendance ?? false,
            updatedAt: new Date()
        },
        $setOnInsert: {
            userId,
            date,
            createdAt: new Date()
        }
    };

    if (Array.isArray(payload.tasks)) {
        update.$set.tasks = normalizeTasks(payload.tasks);
    }

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
    return DailyLog.findOne({
        userId,
        date: normalizedDate
    });
}

async function patchTaskStatus(userId, dailyLogId, taskId, { status, reasonForNonCompletion }) {
    const isNotDone = status === TaskStatus.NOT_DONE;
    const update = {
        'tasks.$[elem].status': status,
        'tasks.$[elem].reasonForNonCompletion': isNotDone ? reasonForNonCompletion || '' : null,
        'tasks.$[elem].reviewStatus': isNotDone ? ReviewStatus.PENDING : ReviewStatus.PENDING,
        'tasks.$[elem].reviewComment': null,
    };
    const log = await DailyLog.findOneAndUpdate(
        { _id: dailyLogId, userId },
        { $set: update },
        { new: true, arrayFilters: [{ 'elem.taskId': taskId }] }
    );
    return log;
}

module.exports = { upsertDailyLog, getDailyLog, patchTaskStatus };
