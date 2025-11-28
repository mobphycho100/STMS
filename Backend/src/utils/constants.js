module.exports = {
    Roles: { ADMIN: 'ADMIN', USER: 'USER' },
    TaskType: { DEFAULT: 'DEFAULT', CUSTOM: 'CUSTOM' },
    TaskStatus: { COMPLETED: 'COMPLETED', PENDING: 'PENDING', NOT_DONE: 'NOT_DONE' },
    Attendance: { PRESENT: 'PRESENT', ABSENT: 'ABSENT' },
    ReviewStatus: { PENDING: 'PENDING', APPROVED: 'APPROVED', REJECTED: 'REJECTED' },
    TaskPriority: { HIGHEST: 'Highest', HIGH: 'High', MEDIUM: 'Medium', LOW: 'Low', ADHOC: 'Adhoc' },
    TaskState: {
        COMPLETED: 'Completed',
        NOT_DONE: 'Not Done',
        YET_TO_START: 'Yet to Start',
        ON_HOLD: 'On Hold',
        IN_PROGRESS: 'In Progress',
        CARRY_FORWARD: 'Carry Forward',
    },
};
