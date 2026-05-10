# Knowledge API

| Endpoint | Method | Permission | Events |
| --- | --- | --- | --- |
| `/documents` | POST | `document.create` | `DOCUMENT_CREATED` |
| `/documents/:id` | GET | `document.read` | none |
| `/documents/:id/versions` | POST | `document.update` | `DOCUMENT_VERSION_CREATED` |
| `/documents/:id/submit` | POST | `document.update` | `DOCUMENT_SUBMITTED` |
| `/documents/:id/validate` | POST | `document.validate` | `DOCUMENT_VALIDATED` |
| `/documents/:id/archive` | POST | `document.archive` | `DOCUMENT_ARCHIVED` |
| `/documents/:id/export` | GET | `document.export` | `DOCUMENT_EXPORTED` |
