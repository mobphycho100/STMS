const mongoose = require('mongoose');

const topicSchema = new mongoose.Schema(
    {
        topicId: { type: mongoose.Schema.Types.ObjectId, default: () => new mongoose.Types.ObjectId() },
        title: { type: String, required: true, trim: true },
    },
    { _id: false }
);

const technologySchema = new mongoose.Schema(
    {
        name: { type: String, required: true, unique: true, trim: true },
        description: { type: String, trim: true },
        topics: { type: [topicSchema], default: [] },
    },
    { timestamps: true }
);

module.exports = mongoose.model('Technology', technologySchema);
