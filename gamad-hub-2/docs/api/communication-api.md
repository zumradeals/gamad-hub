# Communication API

| Endpoint | Method | Permission | Events |
| --- | --- | --- | --- |
| `/communications/announcements` | POST | `announcement.create` | `ANNOUNCEMENT_CREATED`, `ANNOUNCEMENT_PUBLISHED` |
| `/communications/messages` | POST | `message.send` | `MESSAGE_SENT` |
| `/communications/notifications` | POST | `notification.create` | `NOTIFICATION_CREATED` |
| `/communications/notifications/:id/read` | POST | owner only | `NOTIFICATION_READ` |
