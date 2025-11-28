const bcrypt = require('bcrypt');
const connectDB = require('../config/db');
const env = require('../config/env');
const User = require('../models/User');
const { Roles } = require('../utils/constants');

(async () => {
    try {
        await connectDB(env.mongoUri);
        const name = process.env.ADMIN_NAME || 'Admin';
        const email = process.env.ADMIN_EMAIL;
        const password = process.env.ADMIN_PASSWORD;

        if (!email || !password) {
            console.error('ADMIN_EMAIL and ADMIN_PASSWORD must be set in .env');
            process.exit(1);
        }

        const existing = await User.findOne({ email });
        if (existing) {
            console.log('Admin already exists:', email);
            process.exit(0);
        }

        const hash = await bcrypt.hash(password, 10);
        await User.create({ name, email, password: hash, role: Roles.ADMIN });
        console.log('Admin created:', email);
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
})();
