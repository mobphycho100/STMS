const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '..', '.env') });
const bcrypt = require('bcrypt');
const connectDB = require('../config/db');
const env = require('../config/env');
const User = require('../models/User');
const Technology = require('../models/Technology');
const { Roles } = require('../utils/constants');
const mongoose = require('mongoose');

async function upsertAdmin() {
    const name = process.env.ADMIN_NAME || 'Admin';
    const email = process.env.ADMIN_EMAIL;
    const password = process.env.ADMIN_PASSWORD;

    if (!email || !password) {
        throw new Error('ADMIN_EMAIL and ADMIN_PASSWORD must be set in .env');
    }

    let admin = await User.findOne({ email });
    if (!admin) {
        const hash = await bcrypt.hash(password, 10);
        admin = await User.create({ name, email, password: hash, role: Roles.ADMIN });
        console.log('Admin created:', email);
    } else {
        console.log('Admin exists:', email);
    }
}

async function ensureTechnology(name, description, topicTitles) {
    let tech = await Technology.findOne({ name });
    if (!tech) {
        tech = await Technology.create({
            name,
            description,
            topics: topicTitles.map((title) => ({
                topicId: new mongoose.Types.ObjectId(),
                title,
            })),
        });
        console.log('Technology created:', name);
    } else if (!tech.topics || tech.topics.length === 0) {
        tech.topics = topicTitles.map((title) => ({
            topicId: new mongoose.Types.ObjectId(),
            title,
        }));
        await tech.save();
        console.log('Technology topics added:', name);
    } else {
        console.log('Technology exists:', name);
    }
}

(async () => {
    try {
        await connectDB(env.mongoUri);
        await upsertAdmin();

        await ensureTechnology('DSA', 'Data Structures & Algorithms', [
            'DSA Phase 1', 'c++ basics', 'complexcity analysis', 'c++ STL', 'Maths basics', 'Recursions', 'Pesudo code', 'Sorting', 'Arrays', 'Binary search', 'Advance recursion', 'Dynamic programming', 'linked list', 'Binay tree', 'Graphs', 'Binary Search Tree', 'Heaps', 'Bit Manipulation', 'Linked List', 'Stack & Queue', 'Greedy', 'Backtracking'
        ]);
        await ensureTechnology('React JS', 'Frontend library', [
            'Introduction to React js', 'Components and props', 'Lists and keys', 'state and events', 'common mistakes', 'Conditional Rendering', 'State hook (part-2)', 'state hook (part-3)', 'On demand session', 'Debugging using developer tools', 'On demand session-2', 'Effect hook and rules of hook', 'Effect hooks-2', 'Making API call with hooks'
        ]);
        await ensureTechnology('Node JS', 'Backend runtime', [
            'MERN Stack', 'Introduction to Node JS', 'Introduction to Node JS | Part 2', 'Hypertext Transfer Protocol(HTTP)', 'Introduction to Express JS', 'Introduction to Express JS | Part 2', 'Introduction to Express JS | Part 3', 'REST APIs', 'Debugging Common Errors', 'Debugging Common Errors | Part 2', 'Authentication', 'Authentication | Part 2', 'Authentication | Part 3'
        ]);
        await ensureTechnology('DBMS (SQL)', 'Database Management Systems', [
            'Introduction to Database | Part 1', 'Introduction to Database | Part 2', 'Introduction To SQL | Part 1', 'Introduction To SQL | Part 2', 'Introduction to SQL Problem Solving | Part 1', 'Introduction to SQL Problem Solving | Part 2', 'Querying with SQL | Part 1', 'Querying with SQL | Part 2', 'Querying with SQL Problem Solving | Part 1', 'Querying with SQL | Part 3', 'Querying with SQL Problem Solving | Part 2', 'Aggregations', 'Group By', 'Group By with Having', 'Aggregations & Group By Problem Solving | Part 1', 'SQL Expressions and Functions', 'SQL Expressions and Functions Problem Solving', 'SQL Case Clause and Set Operations', 'SQL Case and Set Operations Problem Solving', 'Modeling Databases | Part 1', 'Modeling Databases | Part 2', 'Joins | Part 1', 'SQL Joins Problem Solving', 'Normal Forms', 'Querying with Joins | Part 2', 'Joins | Part 3', 'Views', 'Subqueries', 'Transaction & Indexes'
        ]);
        await ensureTechnology('Typescript', 'TypeScript Language', [
            'Introduction to TypeScript', 'Basic Types in TypesScript', 'Classes and Access modifiers', 'Interfaces in TypeScript', 'Generics in TypeScript', 'Introduction to React', 'Building leaderboard Applications with TypeScript'
        ]);
        await ensureTechnology('MongoDB', 'Document database', [
            'Introduction to MongoDB', 'Create API on Mongo Using Mongoose', 'More CRUD Operations on Mongo with Mongoose', 'Protected Routes with JWT Authentication'
        ]);

        console.log('Seeding completed.');
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
})();
