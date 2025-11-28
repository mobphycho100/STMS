const mongoose = require('mongoose');
const { Roles } = require('../utils/constants');

const userSchema = new mongoose.Schema(
    {
        name: { type: String, required: true, trim: true },
        email: { type: String, required: true, unique: true, lowercase: true, trim: true },
        password: { type: String, required: true },
        role: { type: String, enum: Object.values(Roles), default: Roles.USER },
    },
    { timestamps: true }
);

module.exports = mongoose.model('User', userSchema);
