 # Backend API Endpoints

 | METHOD | PATH | Protected | Roles | Description |
 |---|---|---|---|---|
 | GET | /api/v1/health | No | - | Health check |
 | POST | /api/v1/auth/signup | No | - | Create USER and return JWT |
 | POST | /api/v1/auth/login | No | - | Login and return JWT |
 | GET | /api/v1/tasks/default | Yes | BOTH | List DEFAULT tasks (optional query active=true/false) |
 | POST | /api/v1/tasks/default | Yes | ADMIN | Create DEFAULT task |
 | PUT | /api/v1/tasks/default/:id | Yes | ADMIN | Update DEFAULT task |
 | PATCH | /api/v1/tasks/default/:id/activate | Yes | ADMIN | Activate DEFAULT task |
 | PATCH | /api/v1/tasks/default/:id/deactivate | Yes | ADMIN | Deactivate DEFAULT task |
 | GET | /api/v1/tasks/custom | Yes | USER | List user's CUSTOM tasks |
 | POST | /api/v1/tasks/custom | Yes | USER | Create CUSTOM task |
 | PUT | /api/v1/tasks/custom/:id | Yes | USER | Update own CUSTOM task |
 | DELETE | /api/v1/tasks/custom/:id | Yes | USER | Delete own CUSTOM task |
 | PUT | /api/v1/daily-logs | Yes | USER | Upsert daily log (metrics + tasks) for self |
 | GET | /api/v1/daily-logs?date[&userId] | Yes | BOTH | Get daily log (self; admin can specify userId) |
 | PATCH | /api/v1/daily-logs/:id/tasks/:taskId | Yes | USER | Update a task's status/reason in own daily log |
 | GET | /api/v1/reviews/pending | Yes | ADMIN | List NOT_DONE tasks with PENDING reviews |
 | POST | /api/v1/reviews/:dailyLogId/tasks/:taskId/approve | Yes | ADMIN | Approve reason for NOT_DONE task |
 | POST | /api/v1/reviews/:dailyLogId/tasks/:taskId/reject | Yes | ADMIN | Reject reason for NOT_DONE task |
 | GET | /api/v1/technologies | Yes | BOTH | List technologies |
 | POST | /api/v1/technologies | Yes | ADMIN | Create technology with topics |
 | PUT | /api/v1/technologies/:id | Yes | ADMIN | Update technology |
 | GET | /api/v1/skills/progress?technologyId= | Yes | BOTH | Get skill progress for technology (self; admin can target userId via controller rule) |
 | POST | /api/v1/skills/progress/ack | Yes | USER | Acknowledge topic (self) |
 | POST | /api/v1/skills/progress/unack | Yes | USER | Unacknowledge topic (self) |
 | POST | /api/v1/reports/monthly/generate | Yes | BOTH | Generate monthly report (admin can pass userId) |
 | GET | /api/v1/reports/monthly?month[&userId] | Yes | BOTH | Get monthly report |
 | POST | /api/v1/ai/schedule | Yes | BOTH | Heuristic schedule for self (admin can target any userId) |
 | GET | /api/v1/users | Yes | ADMIN | Admin overview: users with compliance for a month |

