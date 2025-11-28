const Technology = require('../models/Technology');

async function list() {
    return Technology.find({}).sort({ name: 1 });
}

async function create(data) {
    try {
        const tech = await Technology.create(data);
        return tech;
    } catch (err) {
        if (err && err.code === 11000) {
            const e = new Error('Technology name exists');
            e.code = 'NAME_EXISTS';
            throw e;
        }
        throw err;
    }
}

async function update(id, data) {
    const tech = await Technology.findByIdAndUpdate(id, data, { new: true });
    return tech;
}

module.exports = { list, create, update };
