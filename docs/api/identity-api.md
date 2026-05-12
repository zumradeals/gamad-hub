# Identity API

Base path: `/api/v1`

| Endpoint | Method | Permission | Events |
| --- | --- | --- | --- |
| `/identity/gamad-ids` | POST | `identity.create` | `GAMAD_ID_CREATED`, `ACCOUNT_CREATED` |
| `/identity/gamad-ids` | GET | `identity.read` (liste paginée via `skip`, `take`) | none |
| `/identity/gamad-ids/:id` | GET | `identity.read` | none |
| `/identity/gamad-ids/:id/validate` | POST | `identity.validate` | `MEMBER_VALIDATED` |
| `/identity/gamad-ids/:id/suspend` | POST | `identity.suspend` | `MEMBER_SUSPENDED` |
| `/auth/login` | POST | public credential check | `LOGIN_SUCCESS`, `LOGIN_FAILED` |
| `/profiles/:gamadId` | GET/PATCH | self or `profile.read` | `PROFILE_UPDATED` |
