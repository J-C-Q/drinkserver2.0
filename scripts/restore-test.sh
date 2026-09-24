#!/usr/bin/env bash
# Restores a dump from scripts/backup-db.sh into a throwaway LOCAL database
# and compares row counts with the ones recorded at backup time.
#
#   scripts/restore-test.sh backups/drinkserver-YYYYMMDD-HHMMSS.dump
#
# Only ever touches the local database named by RESTORE_DB
# (default drinkserver_restore_test), which is dropped and recreated.
set -euo pipefail
cd "$(dirname "$0")/.."

dump="${1:?usage: scripts/restore-test.sh <file.dump>}"
counts="${dump%.dump}.counts.txt"
db="${RESTORE_DB:-drinkserver_restore_test}"

if [ -z "${PG_BIN:-}" ]; then
    PG_BIN=$(ls -d /opt/homebrew/opt/postgresql@*/bin 2>/dev/null | sort -V | tail -1 || true)
fi
bin() { echo "${PG_BIN:+$PG_BIN/}$1"; }

"$(bin dropdb)" --if-exists "$db"
"$(bin createdb)" "$db"
"$(bin pg_restore)" --no-owner --no-acl --exit-on-error --dbname="$db" "$dump"

if [ ! -f "$counts" ]; then
    echo "Restored into $db; no $counts to compare against."
    exit 0
fi

mismatches=0
while read -r table expected; do
    actual=$("$(bin psql)" -d "$db" -Atc "select count(*) from public.\"$table\"")
    if [ "$actual" = "$expected" ]; then
        printf "  ok   %-20s %s rows\n" "$table" "$actual"
    else
        printf "  DIFF %-20s expected %s, restored %s\n" "$table" "$expected" "$actual"
        mismatches=$((mismatches + 1))
    fi
done < "$counts"

if [ "$mismatches" -gt 0 ]; then
    echo "Restore test FAILED: $mismatches table(s) differ." >&2
    exit 1
fi
echo "Restore test passed: every table in $db matches the backup-time counts."
