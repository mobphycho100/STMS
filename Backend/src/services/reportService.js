const MonthlyReport = require('../models/MonthlyReport');
const DailyLog = require('../models/DailyLog');
const { TaskStatus, ReviewStatus } = require('../utils/constants');
const { getMonthRange } = require('../utils/date');

function parseTimeToHours(timeStr) {
    if (!timeStr) return 0;
    const [hours, minutes] = timeStr.split(':').map(Number);
    return hours + (minutes / 60);
}

async function summarizeLogs(logs) {
    let total = 0;
    let completed = 0;
    let approved = 0;
    let rejected = 0;
    let pendingReview = 0;
    let pending = 0;

    // New metrics
    let totalPracticeHours = 0;
    let totalMiscHours = 0;
    let totalLearningHours = 0;
    let totalDoubtsLogged = 0;
    let totalConceptsExplained = 0;
    const acknowledgedTopics = new Set();

    for (const log of logs) {
        // Track practice sessions and other metrics
        totalPracticeHours += (log.practiceSessionCount || 0) * 1; // Assuming 1 hour per session
        totalDoubtsLogged += log.doubtsLoggedCount || 0;
        totalConceptsExplained += log.conceptExplanationCount || 0;

        // Process tasks
        total += log.tasks?.length || 0;
        for (const t of log.tasks || []) {
            // Track task status
            if (t.status === TaskStatus.COMPLETED) {
                completed += 1;
                // Track learning hours for completed learning tasks
                if (t.type === 'LEARNING') {
                    totalLearningHours += parseTimeToHours(t.actualTime) || 0;
                } else if (t.type === 'MISCELLANEOUS') {
                    totalMiscHours += parseTimeToHours(t.actualTime) || 0;
                }
                // Track acknowledged topics
                if (t.topicId) {
                    acknowledgedTopics.add(t.topicId);
                }
            } else if (t.status === TaskStatus.NOT_DONE) {
                if (t.reviewStatus === ReviewStatus.APPROVED) approved += 1;
                else if (t.reviewStatus === ReviewStatus.REJECTED) rejected += 1;
                else pendingReview += 1;
            } else if (t.status === TaskStatus.PENDING) pending += 1;
        }
    }

    const effectiveCompleted = completed + approved;
    const compliance = total > 0 ? Math.round(((effectiveCompleted / total) * 100 + Number.EPSILON) * 100) / 100 : 100;

    // Get previous month's acknowledged topics for growth calculation
    const prevMonth = new Date();
    prevMonth.setMonth(prevMonth.getMonth() - 1);
    const prevMonthStr = `${prevMonth.getFullYear()}-${String(prevMonth.getMonth() + 1).padStart(2, '0')}`;

    const prevMonthReport = await MonthlyReport.findOne({
        userId: logs[0]?.userId,
        month: prevMonthStr
    });

    const prevMonthTopics = new Set(prevMonthReport?.acknowledgedTopics || []);
    const newTopicsThisMonth = [...acknowledgedTopics].filter(t => !prevMonthTopics.has(t));

    return {
        // Existing metrics
        totalTasksScheduled: total,
        totalTasksCompleted: effectiveCompleted,
        compliancePercentage: compliance,
        breakdown: { completed, approved, rejected, pendingReview, pending },

        // New metrics
        totalPracticeHours: parseFloat(totalPracticeHours.toFixed(2)),
        totalMiscHours: parseFloat(totalMiscHours.toFixed(2)),
        totalLearningHours: parseFloat(totalLearningHours.toFixed(2)),
        totalDoubtsLogged,
        totalConceptsExplained,
        selfLearningGrowth: {
            newTopicsCount: newTopicsThisMonth.length,
            totalTopics: acknowledgedTopics.size,
            growthPercentage: prevMonthTopics.size > 0
                ? Math.round((newTopicsThisMonth.length / prevMonthTopics.size) * 100)
                : acknowledgedTopics.size > 0 ? 100 : 0
        },
        acknowledgedTopics: [...acknowledgedTopics]
    };
}

async function generateMonthlyReport(userId, month) {
    const { startDate, endDate } = getMonthRange(month);
    const logs = await DailyLog.find({ userId, date: { $gte: startDate, $lte: endDate } });
    const summary = await summarizeLogs(logs);

    const report = await MonthlyReport.findOneAndUpdate(
        { userId, month },
        {
            $set: {
                totalTasksScheduled: summary.totalTasksScheduled,
                totalTasksCompleted: summary.totalTasksCompleted,
                compliancePercentage: summary.compliancePercentage,
                generatedAt: new Date(),
                summaryInsights: summary.breakdown,
                // New fields
                totalPracticeHours: summary.totalPracticeHours,
                totalMiscHours: summary.totalMiscHours,
                totalLearningHours: summary.totalLearningHours,
                totalDoubtsLogged: summary.totalDoubtsLogged,
                totalConceptsExplained: summary.totalConceptsExplained,
                selfLearningGrowth: summary.selfLearningGrowth,
                acknowledgedTopics: summary.acknowledgedTopics,
            },
            $setOnInsert: { userId, month },
        },
        { upsert: true, new: true }
    );
    return report;
}

async function getMonthlyReport(userId, month) {
    return MonthlyReport.findOne({ userId, month });
}

module.exports = { generateMonthlyReport, getMonthlyReport };
