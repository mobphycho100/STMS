const mongoose = require('mongoose');

const connectDB = async (mongoUri) => {
    mongoose.set('strictQuery', true);
    await mongoose.connect(mongoUri);
    console.log('MongoDB connected');
};

module.exports = connectDB;
