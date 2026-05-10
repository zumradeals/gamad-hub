# Organization API

| Endpoint | Method | Permission | Events |
| --- | --- | --- | --- |
| `/organization/units` | POST | `organization.create` | `ORGANIZATION_UNIT_CREATED` |
| `/organization/units/:id` | GET | `organization.read` | none |
| `/organization/zumara` | POST | `organization.create` | `ZUMARA_CREATED` |
| `/organization/units/:unitId/members` | POST | `organization.assign_member` | `MEMBER_ATTACHED_TO_UNIT` |
| `/organization/units/:unitId/members/:gamadId/remove` | POST | `organization.assign_member` | `MEMBER_REMOVED_FROM_UNIT` |
| `/organization/units/:unitId/responsibles` | POST | `organization.assign_member` | `RESPONSIBLE_ASSIGNED` |
| `/organization/units/:unitId/archive` | POST | `organization.archive` | `ORGANIZATION_UNIT_ARCHIVED` |
