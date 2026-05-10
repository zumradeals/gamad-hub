# Backup And Restore

## Backup

```bash
sh scripts/backup.sh
```

Backups include PostgreSQL dumps and uploaded files when present.

## Restore

```bash
CONFIRM_RESTORE=yes POSTGRES_BACKUP_FILE=backups/postgres-file.sql sh scripts/restore.sh
```

Restore must be tested outside production first.
