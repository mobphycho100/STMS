const DailyLog = require('../models/DailyLog');
const { TaskStatus, ReviewStatus } = require('../utils/constants');

async function listPending({ userId, date }) {
    const filter = {
        ...(userId && { userId }),
        ...(date && { date }),
        tasks: { $elemMatch: { status: TaskStatus.NOT_DONE, reviewStatus: ReviewStatus.PENDING } },
    };
    const logs = await DailyLog.find(filter).sort({ date: -1 });
    return logs.map((log) => ({
        id: log._id.toString(),
        userId: log.userId.toString(),
        date: log.date,
        tasks: log.tasks
            .filter((t) => t.status === TaskStatus.NOT_DONE && t.reviewStatus === ReviewStatus.PENDING)
            .map((t) => ({
                taskId: t.taskId.toString(),
                type: t.type,
                status: t.status,
                reasonForNonCompletion: t.reasonForNonCompletion,
                reviewStatus: t.reviewStatus,
            })),
    }));
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

module.exports = { listPending, setReviewStatus };
