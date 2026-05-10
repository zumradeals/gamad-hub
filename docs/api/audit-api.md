# Audit API

| Endpoint | Method | Permission | Events |
| --- | --- | --- | --- |
| `/audit/events` | GET | `audit.read` | none |
| `/audit/events/export` | GET | `audit.export` | `AUDIT_EXPORTED` |

Audit payloads redact password, token and secret fields.
