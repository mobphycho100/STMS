const MonthlyReport = require('../models/MonthlyReport');
const DailyLog = require('../models/DailyLog');
const Task = require('../models/Task');
const UserSkillProgress = require('../models/UserSkillProgress');
const Technology = require('../models/Technology');
const { TaskStatus, ReviewStatus, Attendance } = require('../utils/constants');
const { getMonthRange } = require('../utils/date');

function parseTimeToHours(timeStr) {
    if (!timeStr) return 0;
    const [hours, minutes] = String(timeStr).split(':').map(Number);
    return (isNaN(hours) || isNaN(minutes)) ? 0 : hours + (minutes / 60);
}

async function summarizeLogs(userId, startDate, endDate, logs) {
    // Initialize counters
    let total = 0; // Scheduled
    let completed = 0;
    let approved = 0;
    let rejected = 0;
    let pendingReview = 0;
    let pending = 0;
    let xpPoints = 0;

    // Metrics from DailyLogs
    let totalPracticeSessions = 0;
    let totalDoubtsLogged = 0;
    let totalConceptsExplained = 0;
    let standupsPresent = 0;
    let syncupsPresent = 0;

    // Time-based from Tasks by exact title
    let totalPracticeHours = 0;
    let totalMiscHours = 0;
    let totalLearningHours = 0;

    // Track acknowledged topics and new topics
    const acknowledgedTopics = new Set();
    const newTopicsByTechnology = {};

    // 1) TASKS: Fetch all tasks for this user within month
    const startDt = new Date(`${startDate}T00:00:00.000Z`);
    const endDt = new Date(`${endDate}T23:59:59.999Z`);
    const tasks = await Task.find(
        {
            $and: [
                { $or: [{ createdBy: userId }, { assignedTo: userId }] },
                {
                    $or: [
                        { date: { $gte: startDate, $lte: endDate } },
                        {
                            $and: [
                                { $or: [{ date: null }, { date: '' }, { date: { $exists: false } }] },
                                { createdAt: { $gte: startDt, $lte: endDt } }
                            ]
                        }
                    ]
                }
            ],
        },
        { title: 1, status: 1, plannedTime: 1, actualTime: 1, reviewStatus: 1, type: 1, createdBy: 1, assignedTo: 1 }
    ).lean();

    total = tasks.length;
    completed = tasks.filter(t => t.status === 'Completed').length;
    // 'Pending' per rules: include Task docs with 'Yet to Start'
    pending = tasks.filter(t => t.status === 'Yet to Start').length;

    // Review breakdown from Task documents (source of truth)
    approved = tasks.filter(t => t.status === 'Not Done' && t.reviewStatus === 'APPROVED').length;
    rejected = tasks.filter(t => t.status === 'Not Done' && t.reviewStatus === 'REJECTED').length;
    pendingReview = tasks.filter(t => t.status === 'Not Done' && (!t.reviewStatus || t.reviewStatus === 'PENDING')).length;

    // XP from tasks
    const isIdEq = (a, b) => String(a || '') === String(b || '');
    for (const t of tasks) {
        if (t.status === 'Completed') {
            const isDefault = t.type === 'DEFAULT';
            const isAssigned = t.assignedTo && !isIdEq(t.createdBy, t.assignedTo) && isIdEq(t.assignedTo, userId);
            const isPersonal = t.type === 'CUSTOM' && isIdEq(t.createdBy, userId) && (!t.assignedTo || isIdEq(t.assignedTo, userId));
            if (isDefault || isAssigned) xpPoints += 10;
            else if (isPersonal) xpPoints += 5;
        } else if (t.status === 'Not Done') {
            // Penalty unless admin approved the reason
            if (t.reviewStatus !== 'APPROVED') xpPoints -= 10;
        }
    }

    // Time-based hours by exact title match, using actualTime or fallback to plannedTime
    const sumTimeHours = (arr) => arr.reduce((acc, t) => {
        const time = t.actualTime || t.plannedTime;
        return acc + parseTimeToHours(time);
    }, 0);
    totalPracticeHours = sumTimeHours(tasks.filter(t => t.title === 'Practice Session'));
    totalMiscHours = sumTimeHours(tasks.filter(t => t.title === 'Miscellaneous Tasks'));
    totalLearningHours = sumTimeHours(tasks.filter(t => t.title === 'Learning'));

    // 2) DAILY LOGS: aggregate metrics only; review breakdown now comes from Tasks
    for (const log of logs) {
        totalPracticeSessions += (log.practiceSessionCount || 0);
        totalDoubtsLogged += (log.doubtsLoggedCount || 0);
        totalConceptsExplained += (log.conceptExplanationCount || 0);
        if (log.standupAttendance === Attendance.PRESENT) { standupsPresent += 1; xpPoints += 10; }
        if (log.syncupAttendance === Attendance.PRESENT) { syncupsPresent += 1; xpPoints += 10; }
        // Practice and concepts contribute to XP
        xpPoints += (log.practiceSessionCount || 0) * 3;
        xpPoints += (log.conceptExplanationCount || 0) * 3;
    }

    // Compliance uses Completed only per rules
    const compliance = total > 0 ? Math.round(((completed / total) * 100 + Number.EPSILON) * 100) / 100 : 100;

    // Skills: topics acknowledged, totals, and new topics this month by technology
    let newTopicsThisMonth = 0;
    let totalTopicsAcrossTech = 0;
    if (userId) {
        const prog = await UserSkillProgress.find({ userId }).lean();
        const techIds = prog.map(p => p.technologyId);
        const techDocs = await Technology.find({ _id: { $in: techIds } }, { name: 1, topics: 1 }).lean();
        const techMap = new Map(techDocs.map(t => [String(t._id), t]));

        // Total topics across ALL technologies in the system (per rules)
        const allTechDocs = await Technology.find({}, { topics: 1 }).lean();
        totalTopicsAcrossTech = allTechDocs.reduce((acc, t) => acc + (t.topics?.length || 0), 0);

        for (const p of prog) {
            const techIdStr = String(p.technologyId);
            const tech = techMap.get(techIdStr);
            const techName = tech?.name || techIdStr;
            let monthlyCount = 0;
            for (const tp of (p.topicProgress || [])) {
                if (tp.acknowledged) {
                    acknowledgedTopics.add(String(tp.topicId));
                    if (tp.acknowledgedAt && tp.acknowledgedAt >= new Date(startDate) && tp.acknowledgedAt <= new Date(endDate)) {
                        monthlyCount += 1;
                    }
                }
            }
            if (monthlyCount > 0) {
                newTopicsByTechnology[techName] = (newTopicsByTechnology[techName] || 0) + monthlyCount;
                newTopicsThisMonth += monthlyCount;
            }
        }
    }

    return {
        // Existing metrics
        totalTasksScheduled: total,
        totalTasksCompleted: completed,
        compliancePercentage: compliance,
        breakdown: { completed, approved, rejected, pendingReview, pending },
        xpPoints,

        // New metrics
        totalPracticeHours: parseFloat(totalPracticeHours.toFixed(2)),
        totalMiscHours: parseFloat(totalMiscHours.toFixed(2)),
        totalLearningHours: parseFloat(totalLearningHours.toFixed(2)),
        totalDoubtsLogged,
        totalConceptsExplained,
        totalPracticeSessions,
        standupsPresent,
        syncupsPresent,
        selfLearningGrowth: {
            newTopicsCount: newTopicsThisMonth,
            // For UI binding, expose acknowledged total here too
            totalTopics: acknowledgedTopics.size,
            growthPercentage: totalTopicsAcrossTech > 0
                ? Math.round((acknowledgedTopics.size / totalTopicsAcrossTech) * 100)
                : 0
        },
        acknowledgedTopics: [...acknowledgedTopics],
        newTopicsByTechnology,
        totalTopicsAcrossTechnologies: totalTopicsAcrossTech
    };
}

async function generateMonthlyReport(userId, month) {
    const { startDate, endDate } = getMonthRange(month);
    const logs = await DailyLog.find({ userId, date: { $gte: startDate, $lte: endDate } });
    const summary = await summarizeLogs(userId, startDate, endDate, logs);

    const report = await MonthlyReport.findOneAndUpdate(
        { userId, month },
        {
            $set: {
                totalTasksScheduled: summary.totalTasksScheduled,
                totalTasksCompleted: summary.totalTasksCompleted,
                compliancePercentage: summary.compliancePercentage,
                generatedAt: new Date(),
                xpPoints: summary.xpPoints,
                summaryInsights: {
                    ...summary.breakdown,
                    newTopicsByTechnology: summary.newTopicsByTechnology,
                    totalTopicsAcrossTechnologies: summary.totalTopicsAcrossTechnologies
                },
                // New fields
                totalPracticeHours: summary.totalPracticeHours,
                totalMiscHours: summary.totalMiscHours,
                totalLearningHours: summary.totalLearningHours,
                totalDoubtsLogged: summary.totalDoubtsLogged,
                totalConceptsExplained: summary.totalConceptsExplained,
                selfLearningGrowth: summary.selfLearningGrowth,
                acknowledgedTopics: summary.acknowledgedTopics,
                totalPracticeSessions: summary.totalPracticeSessions,
                standupsPresent: summary.standupsPresent,
                syncupsPresent: summary.syncupsPresent,
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
