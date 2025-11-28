const mongoose = require('mongoose');
const { TaskType, TaskStatus, Attendance, ReviewStatus } = require('../utils/constants');

const dailyTaskSchema = new mongoose.Schema(
    {
        taskId: { type: mongoose.Schema.Types.ObjectId, ref: 'Task', required: true },
        type: { type: String, enum: Object.values(TaskType), required: true },
        status: { type: String, enum: Object.values(TaskStatus), default: TaskStatus.PENDING },
        reasonForNonCompletion: { type: String, default: null },
        reviewStatus: { type: String, enum: Object.values(ReviewStatus), default: ReviewStatus.PENDING },
        reviewComment: { type: String, default: null },
    },
    { _id: false }
);

const dailyLogSchema = new mongoose.Schema(
    {
        userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        date: { type: String, required: true }, // YYYY-MM-DD
        practiceSessionCount: { type: Number, default: 0 },
        doubtsLoggedCount: { type: Number, default: 0 },
        conceptExplanationCount: { type: Number, default: 0 },
        standupAttendance: { type: String, enum: Object.values(Attendance), default: Attendance.ABSENT },
        syncupAttendance: { type: String, enum: Object.values(Attendance), default: Attendance.ABSENT },
        tasks: { type: [dailyTaskSchema], default: [] },
    },
    { timestamps: true }
);

// Ensure one log per user per date
dailyLogSchema.index({ userId: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('DailyLog', dailyLogSchema);
