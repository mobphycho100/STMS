const mongoose = require('mongoose');

const monthlyReportSchema = new mongoose.Schema(
    {
        userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        month: { type: String, required: true }, // YYYY-MM
        totalTasksScheduled: { type: Number, default: 0 },
        totalTasksCompleted: { type: Number, default: 0 },
        compliancePercentage: { type: Number, default: 0 },
        generatedAt: { type: Date, default: Date.now },
        summaryInsights: { type: mongoose.Schema.Types.Mixed, default: {} },
        // New fields
        totalPracticeHours: { type: Number, default: 0 },
        totalMiscHours: { type: Number, default: 0 },
        totalLearningHours: { type: Number, default: 0 },
        totalDoubtsLogged: { type: Number, default: 0 },
        totalConceptsExplained: { type: Number, default: 0 },
        selfLearningGrowth: { type: mongoose.Schema.Types.Mixed, default: {} },
        acknowledgedTopics: { type: [String], default: [] },
    },
    { timestamps: true }
);

monthlyReportSchema.index({ userId: 1, month: 1 }, { unique: true });

module.exports = mongoose.model('MonthlyReport', monthlyReportSchema);
