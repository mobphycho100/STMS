const dayjs = require('dayjs');

function formatDate(date) {
    return dayjs(date).format('YYYY-MM-DD');
}

function formatMonth(date) {
    return dayjs(date).format('YYYY-MM');
}

function getMonthRange(monthStr) {
    const start = dayjs(`${monthStr}-01`);
    const end = start.endOf('month');
    return { startDate: start.format('YYYY-MM-DD'), endDate: end.format('YYYY-MM-DD') };
}

module.exports = { formatDate, formatMonth, getMonthRange };
