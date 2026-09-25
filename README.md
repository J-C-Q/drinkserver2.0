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

`vercel.json` schedules `/api/cron/achievements` daily at 03:00 UTC; it re-evaluates achievements for all users, catching awards whose after-purchase run failed. Vercel sends `Authorization: Bearer $CRON_SECRET`, so set `CRON_SECRET` in the Vercel project; without it the route refuses all requests.

Achievements are rows in `Achievement`; the rule for each is in `src/lib/achievement-rules.ts`, looked up by name. A row without a rule is shown but never awarded. Rules are evaluated from the full history, except "Last One", which the order action awards in the purchase transaction. New rows come as a data migration (see `4_more_achievements`); users earn them from their existing history on their next order or the next cron run.

The service worker (`src/app/sw.ts`, built with Serwist) is disabled in development. It caches only static assets; pages and API responses always go to the network.

## Tests

- `npm run test:unit`: unit tests (Berlin calendar boundaries, money parsing, achievement rules), no database needed.
- `npm run test:migrations`: builds a scratch database at the old schema with legacy data, applies the migrations and checks the conversions. Needs `ADMIN_DATABASE_URL` pointing at a local server, e.g. `postgresql://<you>@localhost:5432/postgres`.
- `npm run test:integration`: end-to-end checks against a running app (authorization, stock races, payments, sessions, rate limits, cron). Set `CRON_SECRET` to the app's value to include the authorized cron checks. Start the app first, then run with `DATABASE_URL` set to the same local database. **It deletes all orders and payments and reseeds the test data**, so it refuses non-local databases.

CI (`.github/workflows/ci.yml`) runs lint, typecheck, unit tests and a dependency audit, then the migration and integration tests against PostgreSQL 15 and a production build.

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

Additive migrations (such as `2_order_nutrition_snapshot`, which only adds columns, or `4_more_achievements`, which only adds rows and an index) can be deployed before the code that uses them, without downtime. Deploy the migration and the matching code together when a migration changes existing columns: the code after `1_money_cents_relations_payments_tokens` expects `priceCents`, and the code before it expects `itemprice`.
