// Heuristic scheduler designed to be swappable with an LLM-backed implementation later

function allocateBuckets(total, weights) {
    const entries = Object.entries(weights);
    let remaining = total;
    const out = {};
    for (let i = 0; i < entries.length; i++) {
        const [key, w] = entries[i];
        const val = i === entries.length - 1 ? remaining : Math.floor((total * w) / 1);
        out[key] = Math.min(val, remaining);
        remaining -= out[key];
    }
    return out;
}

function chunkIntoBlocks(items, minutesBudget, kind) {
    const blocks = [];
    let remaining = minutesBudget;
    for (const it of items) {
        if (remaining <= 0) break;
        const min = Math.min(remaining, it.estimatedMinutes || 30);
        blocks.push({ kind, title: it.title, referenceId: it.id || it.topicId || null, minutes: min });
        remaining -= min;
    }
    return { blocks, used: minutesBudget - remaining, remaining };
}

function distributeOverDays(periodDates, blocksPerDay) {
    const out = [];
    let dayIdx = 0;
    for (const b of blocksPerDay) {
        out.push({ ...b, date: periodDates[dayIdx] });
        dayIdx = (dayIdx + 1) % periodDates.length;
    }
    return out;
}

function linearTimes(blocks, start = '09:00') {
    const res = [];
    let [h, m] = start.split(':').map(Number);
    const add = (mins) => {
        const endMin = h * 60 + m + mins;
        const eh = Math.floor(endMin / 60);
        const em = endMin % 60;
        const startStr = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
        const endStr = `${String(eh).padStart(2, '0')}:${String(em).padStart(2, '0')}`;
        h = eh;
        m = em;
        return { start: startStr, end: endStr };
    };
    for (const b of blocks) {
        const t = add(b.minutes);
        res.push({ ...b, start: t.start, end: t.end });
    }
    return res;
}

function enumerateDates(day, week) {
    if (day) return [day.date];
    const arr = [];
    const d1 = new Date(week.startDate);
    const d2 = new Date(week.endDate);
    for (let d = new Date(d1); d <= d2; d.setDate(d.getDate() + 1)) {
        arr.push(d.toISOString().slice(0, 10));
    }
    return arr;
}

function schedule(input) {
    const { day, week, pendingTasks = [], skillTopics = [], availableMinutes } = input;
    const dates = enumerateDates(day, week);
    const perDayMinutes = availableMinutes;
    const totalMinutes = perDayMinutes * dates.length;

    // Base weights
    const weights = { default: 0.6, custom: 0.25, skills: 0.15 };

    const defaultTasks = pendingTasks.filter((t) => t.type === 'DEFAULT');
    const customTasks = pendingTasks.filter((t) => t.type === 'CUSTOM');

    const minutesByBucket = allocateBuckets(totalMinutes, weights);

    const d = chunkIntoBlocks(defaultTasks, minutesByBucket.default, 'TASK_DEFAULT');
    const c = chunkIntoBlocks(customTasks, minutesByBucket.custom, 'TASK_CUSTOM');
    const s = chunkIntoBlocks(skillTopics, minutesByBucket.skills, 'SKILL');

    // Reallocate any leftover from one bucket to others
    let leftover = d.remaining + c.remaining + s.remaining;
    let pool = [...defaultTasks.slice(d.blocks.length), ...customTasks.slice(c.blocks.length), ...skillTopics.slice(s.blocks.length)];
    const extra = chunkIntoBlocks(pool, leftover, 'MIXED');

    const allBlocks = [...d.blocks, ...c.blocks, ...s.blocks, ...extra.blocks];
    const distributed = distributeOverDays(dates, allBlocks);

    // Build daily sequential timeline
    const blocksWithTime = [];
    for (const date of dates) {
        const todays = distributed.filter((b) => b.date === date);
        blocksWithTime.push(...linearTimes(todays, '09:00').map((b) => ({ ...b, date })));
    }

    const allocated = allBlocks.reduce((acc, b) => acc + b.minutes, 0);
    const unallocated = Math.max(totalMinutes - allocated, 0);

    const tips = [
        'Prioritize DEFAULT tasks first; they have higher impact on compliance.',
        'If time runs short, trim CUSTOM tasks to the essentials.',
        'For skills, focus on hands-on examples before theory.',
        'Batch similar tasks to minimize context switching.',
    ];

    return {
        period: day ? { type: 'day', day: day.date } : { type: 'week', startDate: week.startDate, endDate: week.endDate },
        allocatedMinutes: allocated,
        unallocatedMinutes: unallocated,
        blocks: blocksWithTime,
        tips,
    };
}

module.exports = { schedule };
