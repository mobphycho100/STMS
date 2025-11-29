const User = require('../models/User');
const MonthlyReport = require('../models/MonthlyReport');
const reportService = require('./reportService');
const dayjs = require('dayjs');

async function listWithCompliance(month) {
    const monthStr = month || dayjs().format('YYYY-MM');
    const users = await User.find({}).sort({ createdAt: -1 });
    const results = [];
    for (const u of users) {
        let report = await MonthlyReport.findOne({ userId: u._id, month: monthStr });
        if (!report) {
            report = await reportService.generateMonthlyReport(u._id, monthStr);
        }
        results.push({
            id: u._id.toString(),
            name: u.name,
            email: u.email,
            role: u.role,
            month: monthStr,
            compliancePercentage: report ? report.compliancePercentage : 0,
            xpPoints: report ? (report.xpPoints || 0) : 0,
        });
    }
    // Sort users by XP (desc)
    return results.sort((a, b) => (b.xpPoints || 0) - (a.xpPoints || 0));
}

module.exports = { listWithCompliance };
