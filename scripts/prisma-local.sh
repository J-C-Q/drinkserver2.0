#!/usr/bin/env bash
# Runs the Prisma CLI against the local development database.
#
#   scripts/prisma-local.sh migrate dev --name add_something
#   scripts/prisma-local.sh migrate status
#
# The Prisma CLI reads .env, which points at production. This wrapper loads
# DATABASE_URL and DIRECT_URL from .env.development.local instead (variables
# already set in the environment take precedence over .env) and refuses to
# run unless both point at localhost.
set -euo pipefail
cd "$(dirname "$0")/.."

ENV_FILE=".env.development.local"
read_var() {
    grep -E "^$1=" "$ENV_FILE" | head -1 | cut -d= -f2- | sed -e 's/^"//' -e 's/"$//'
}
DATABASE_URL=$(read_var DATABASE_URL)
DIRECT_URL=$(read_var DIRECT_URL)

for url in "$DATABASE_URL" "$DIRECT_URL"; do
    host=$(echo "$url" | sed -E 's#^[a-z]+://([^@/]*@)?([^:/?]+).*#\2#')
    case "$host" in
        localhost|127.0.0.1) ;;
        *) echo "Refusing to run: $ENV_FILE points at non-local host '$host'." >&2; exit 1 ;;
    esac
done

export DATABASE_URL DIRECT_URL
exec npx prisma "$@"
