const mongoose = require('mongoose');
const { TaskType } = require('../utils/constants');

function formatTime(val) {
    if (!val) return undefined;
    if (typeof val !== 'string') val = String(val);
    const m = val.match(/^(\d{1,2}):(\d{1,2})$/);
    if (m) {
        const h = parseInt(m[1], 10);
        const min = parseInt(m[2], 10);
        const mm = String(min).padStart(2, '0');
        return `${h}:${mm}`;
    }
    // fallback: numbers like "90" -> treat as minutes
    const num = parseInt(val, 10);
    if (!isNaN(num)) {
        const h = Math.floor(num / 60);
        const mm = String(num % 60).padStart(2, '0');
        return `${h}:${mm}`;
    }
    return undefined;
}

const PRIORITY = ['Highest', 'High', 'Medium', 'Low', 'Adhoc'];
const STATUS = ['Completed', 'Not Done', 'Yet to Start', 'On Hold', 'In Progress', 'Carry Forward'];

const taskSchema = new mongoose.Schema(
    {
        // New fields per spec
        category: { type: String, trim: true },
        priority: { type: String, enum: PRIORITY, default: 'Medium' },
        status: { type: String, enum: STATUS, default: 'Yet to Start' },
        plannedTime: {
            type: String,
            set: formatTime,
        },
        actualTime: {
            type: String,
            set: formatTime,
            default: '0:00',
        },
        remarks: { type: String, trim: true, default: '' },
        date: { type: String, trim: true }, // YYYY-MM-DD
        createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },

        // Backward-compatible fields (retain to avoid breaking existing flows)
        title: { type: String, required: true, trim: true },
        description: { type: String, trim: true },
        type: { type: String, enum: Object.values(TaskType), required: true },
        isActive: { type: Boolean, default: true },
    },
    { timestamps: true }
);

module.exports = mongoose.model('Task', taskSchema);
