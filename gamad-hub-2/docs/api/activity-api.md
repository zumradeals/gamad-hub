# Activity API

| Endpoint | Method | Permission | Events |
| --- | --- | --- | --- |
| `/activities` | POST | `activity.create` | `ACTIVITY_CREATED` |
| `/activities/:id` | GET | `activity.read` | none |
| `/activities/:id/submit` | POST | `activity.update` | `ACTIVITY_SUBMITTED` |
| `/activities/:id/validate` | POST | `activity.validate` | `ACTIVITY_VALIDATED` |
| `/activities/:id/reject` | POST | `activity.validate` | `ACTIVITY_REJECTED` |
| `/activities/:id/start` | POST | `activity.update` | `ACTIVITY_STARTED` |
| `/activities/:id/complete` | POST | `activity.update` | `ACTIVITY_COMPLETED` |
| `/activities/:id/archive` | POST | `activity.archive` | `ACTIVITY_ARCHIVED` |
| `/activities/:activityId/tasks` | POST | `task.create` | `TASK_CREATED`, `TASK_ASSIGNED` |
| `/activities/tasks/:taskId/complete` | POST | `task.update` | `TASK_COMPLETED` |
