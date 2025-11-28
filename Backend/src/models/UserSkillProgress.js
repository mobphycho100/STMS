const mongoose = require('mongoose');

const topicProgressSchema = new mongoose.Schema(
    {
        topicId: {
            type: mongoose.Schema.Types.ObjectId,
            required: [true, 'Topic ID is required']
        },
        title: { type: String, required: [true, 'Title is required'] },
        acknowledged: {
            type: Boolean,
            default: false
        },
        acknowledgedAt: {
            type: Date,
            default: null
        },
        unacknowledgedAt: {
            type: Date,
            default: null
        }
    },
    {
        _id: false,
        timestamps: false
    }
);

const userSkillProgressSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: [true, 'User ID is required'],
            index: true
        },
        technologyId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Technology',
            required: [true, 'Technology ID is required'],
            index: true
        },
        topicProgress: {
            type: [topicProgressSchema],
            default: []
        },
    },
    {
        timestamps: true,
        toJSON: { virtuals: true },
        toObject: { virtuals: true }
    }
);

// Compound index for faster lookups
userSkillProgressSchema.index({ userId: 1, technologyId: 1 }, { unique: true });

// Index for topic progress lookups
userSkillProgressSchema.index({ 'topicProgress.topicId': 1 });
userSkillProgressSchema.index({ 'topicProgress.acknowledged': 1 });

module.exports = mongoose.model('UserSkillProgress', userSkillProgressSchema);
