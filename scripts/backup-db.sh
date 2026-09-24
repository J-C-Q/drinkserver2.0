#!/usr/bin/env bash
# Backs up the database behind DIRECT_URL with pg_dump.
#
#   scripts/backup-db.sh                      # reads DIRECT_URL from .env
#   ENV_FILE=.env.other scripts/backup-db.sh
#
# DIRECT_URL is used (not DATABASE_URL) because pg_dump needs a direct,
# non-pooled connection. Writes to backups/ (gitignored):
#   <name>.dump         custom-format dump, restorable with pg_restore
#   <name>.counts.txt   row count per table at backup time, for verification
# The dump contains personal data and password hashes: keep it private.
set -euo pipefail
cd "$(dirname "$0")/.."

ENV_FILE="${ENV_FILE:-.env}"
URL=$(grep -E '^DIRECT_URL=' "$ENV_FILE" | head -1 | cut -d= -f2- | sed -e 's/^"//' -e 's/"$//' -e "s/^'//" -e "s/'$//")
if [ -z "$URL" ]; then
    echo "DIRECT_URL not found in $ENV_FILE" >&2
    exit 1
fi

# Use PG_BIN if set, otherwise the newest Homebrew PostgreSQL, otherwise PATH.
if [ -z "${PG_BIN:-}" ]; then
    PG_BIN=$(ls -d /opt/homebrew/opt/postgresql@*/bin 2>/dev/null | sort -V | tail -1 || true)
fi
PSQL="${PG_BIN:+$PG_BIN/}psql"
PG_DUMP="${PG_BIN:+$PG_BIN/}pg_dump"
PG_RESTORE="${PG_BIN:+$PG_BIN/}pg_restore"

server_major=$("$PSQL" "$URL" -Atc "show server_version_num" | cut -c1-2)
client_major=$("$PG_DUMP" --version | grep -oE '[0-9]+' | head -1)
echo "Server PostgreSQL $server_major, pg_dump $client_major"
if [ "$client_major" -lt "$server_major" ]; then
    echo "pg_dump is older than the server. Install a matching version:" >&2
    echo "  brew install postgresql@$server_major" >&2
    exit 1
fi

mkdir -p backups
chmod 700 backups
name="backups/drinkserver-$(date +%Y%m%d-%H%M%S)"
umask 077

"$PSQL" "$URL" -At -F ' ' -c "
    select format('%s %s', table_name,
        (xpath('/row/c/text()', query_to_xml(format('select count(*) as c from public.%I', table_name), false, true, '')))[1]::text)
    from information_schema.tables
    where table_schema = 'public' and table_type = 'BASE TABLE'
    order by table_name" > "$name.counts.txt"

"$PG_DUMP" "$URL" --format=custom --no-owner --no-acl --file="$name.dump"

# A dump that pg_restore cannot list is not a backup.
tables=$("$PG_RESTORE" --list "$name.dump" | grep -c " TABLE DATA ")
echo "Wrote $name.dump ($(du -h "$name.dump" | cut -f1), $tables tables with data)"
echo "Row counts at backup time ($name.counts.txt):"
sed 's/^/  /' "$name.counts.txt"
echo
echo "Next: scripts/restore-test.sh $name.dump"
