A polished version of the drink server for theoffice.

## Local development

Requires Node.js and PostgreSQL (for example `brew install postgresql@16 && brew services start postgresql@16`).

1. `createdb drinkserver_dev`
2. Create `.env.development.local` (see `.env.example`), pointing both database URLs at the local database:
   ```
   DATABASE_URL="postgresql://<you>@localhost:5432/drinkserver_dev"
   DIRECT_URL="postgresql://<you>@localhost:5432/drinkserver_dev"
   AUTH_TRUST_HOST=true
   NEXT_PUBLIC_APP_URL="http://localhost:3000"
   RESEND_API_KEY="re_local_placeholder"
   ```
3. `scripts/prisma-local.sh migrate deploy` creates the tables.
4. `npm run db:seed-dev` adds test accounts (`admin@test.local`, `user@test.local`, `user2@test.local`, password `password123`) and drinks.
5. `npm run dev`

**The Prisma CLI reads `.env`, which points at production.** Run Prisma commands locally through `scripts/prisma-local.sh`, which uses `.env.development.local` and refuses non-local hosts. `next start` also ignores `.env.development.local`; the `prod-local` entry in `.claude/launch.json` runs a production build against the local database.

The service worker (`src/app/sw.ts`, built with Serwist) is disabled in development. It caches only static assets; pages and API responses always go to the network.

## Database backups

`scripts/backup-db.sh` dumps the database behind `DIRECT_URL` in `.env` to `backups/` (gitignored), with the row count of every table. `scripts/restore-test.sh <file.dump>` restores it into a throwaway local database and checks the counts. A backup counts only once the restore test passes. Dumps contain personal data and password hashes; keep them private.

## Schema changes

Schema changes are Prisma migrations in `prisma/migrations`. `0_init` is the baseline matching the schema as it was before migrations were introduced.

1. Change `prisma/schema.prisma`, then `scripts/prisma-local.sh migrate dev --name <change>` to create and apply the migration locally.
2. Before deploying: back up production and pass the restore test.
3. `npx prisma migrate deploy` applies pending migrations to the database in `.env`.

One-time setup for an existing production database (created with `prisma db push`), after a backup. `0_init` describes the schema as it was before migration `1_…`, so this must run before `1_…` is deployed:

```
npx prisma migrate resolve --applied 0_init
npx prisma migrate deploy
```

Each migration runs in a single transaction. If `migrate deploy` fails, the database is left unchanged, but Prisma records the migration as failed and refuses further deploys. Fix the cause, then `npx prisma migrate resolve --rolled-back <migration name>` and deploy again.

Deploy the migration and the matching code together: the code after `1_money_cents_relations_payments_tokens` expects `priceCents`, and the code before it expects `itemprice`.
