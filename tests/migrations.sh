#!/usr/bin/env bash
# Runs the migrations against a scratch database that starts at the old
# (pre-migration) schema with legacy data, and checks the conversions.
#
#   ADMIN_DATABASE_URL=postgresql://<you>@localhost:5432/postgres tests/migrations.sh
#
# ADMIN_DATABASE_URL must point at a LOCAL server; the script creates and drops
# the scratch databases drinkserver_migration_test and drinkserver_migration_fail.
set -uo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
PSQL="${PSQL:-psql}"
ADMIN="${ADMIN_DATABASE_URL:?set ADMIN_DATABASE_URL to a local postgres database, e.g. .../postgres}"
M="$ROOT/prisma/migrations"

host=$(echo "$ADMIN" | sed -E 's#^[a-z]+://([^@/]*@)?([^:/?]+).*#\2#')
case "$host" in
    localhost|127.0.0.1) ;;
    *) echo "Refusing to run: ADMIN_DATABASE_URL points at non-local host '$host'." >&2; exit 1 ;;
esac
url_for(){ echo "$ADMIN" | sed -E "s#/[^/?]+(\?|$)#/$1\1#"; }

pass=0; fail=0
check(){ if [[ "$2" == *"$3"* ]]; then echo "PASS  $1"; pass=$((pass+1)); else echo "FAIL  $1 -> got: ${2:0:200}"; fail=$((fail+1)); fi; }
fresh(){ "$PSQL" "$ADMIN" -q -c "drop database if exists $1" -c "create database $1"; }
run(){ "$PSQL" "$1" -q -v ON_ERROR_STOP=1 "${@:2}"; }

# Legacy rows as the old schema stored them: float euros, plaintext tokens.
LEGACY_DATA=$(cat <<'SQL'
insert into "User"(id,name,email,"emailVerified",authorized,password,role,achievements)
  values ('u1','Alice','a@test.local',now(),true,'x','USER','{}'),
         ('u2','Bob','b@test.local',now(),true,'x','ADMIN','{}');
insert into "Item"(itemid,itemname,itemprice,quantity,sugar,caffeine)
  values ('i1','Mate',1.5,10,25,100), ('i2','Old Cola',0.9371,0,33,null);
insert into "Order"("orderId","userId",username,itemid,itemname,itemprice,date,status) values
  ('o1','u1','Alice','i1','Mate',1.5,now(),'PENDING'),
  ('o2','u1','Alice','i2','Cola',0.9371,now(),'COMPLETED'),
  ('o3','u2','Bob','i2','Cola',0.9695,now(),'COMPLETED'),
  ('o4','u2','Bob','i1','Mate',1.4245,now(),'PENDING');
insert into "VerificationToken"(id,email,token,expires) values ('v1','a@test.local','plain-token',now());
insert into "PasswordResetToken"(id,email,token,expires) values ('p1','a@test.local','plain-reset',now());
SQL
)

echo "== upgrade from the old schema"
DB=drinkserver_migration_test; U=$(url_for $DB)
fresh $DB
run "$U" -f "$M/0_init/migration.sql"
run "$U" -c "$LEGACY_DATA"
for m in "$M"/[1-9]*/; do
    check "applies $(basename "$m")" "$(run "$U" -f "$m/migration.sql" 2>&1 && echo ok)" "ok"
done
q(){ "$PSQL" "$U" -At -c "$1"; }
check "order prices in cents, rounded" "$(q "select string_agg(\"orderId\"||'='||\"priceCents\", ',' order by \"orderId\") from \"Order\"")" "o1=150,o2=94,o3=97,o4=142"
check "item prices in cents"     "$(q "select string_agg(itemid||'='||\"priceCents\", ',' order by itemid) from \"Item\"")" "i1=150,i2=94"
check "old price columns gone"   "$(q "select count(*) from information_schema.columns where column_name='itemprice'")" "0"
check "plaintext tokens removed" "$(q 'select (select count(*) from "VerificationToken") + (select count(*) from "PasswordResetToken")')" "0"
check "token columns hashed"     "$(q "select string_agg(table_name||'.'||column_name, ',' order by table_name) from information_schema.columns where column_name in ('token','tokenHash')")" "PasswordResetToken.tokenHash,VerificationToken.tokenHash"
check "nutrition backfilled from items" "$(q "select string_agg(\"orderId\"||'='||coalesce(sugar::text,'-')||'/'||coalesce(caffeine::text,'-'), ',' order by \"orderId\") from \"Order\"")" "o1=25/100,o2=33/-,o3=33/-,o4=25/100"
check "statuses unchanged"       "$(q "select string_agg(status::text, ',' order by \"orderId\") from \"Order\"")" "PENDING,COMPLETED,COMPLETED,PENDING"
check "foreign keys exist"       "$(q "select string_agg(conname, ',' order by conname) from pg_constraint where contype='f' and conrelid in ('\"Order\"'::regclass, '\"Payment\"'::regclass)")" "Order_itemid_fkey,Order_paymentId_fkey,Order_userId_fkey,Payment_confirmedById_fkey,Payment_userId_fkey"
check "user with orders can't be deleted" "$(q "delete from \"User\" where id='u1'" 2>&1)" "Order_userId_fkey"
check "negative stock refused"   "$(q "update \"Item\" set quantity=-1 where itemid='i1'" 2>&1)" "Item_quantity_nonnegative"
check "no drift against schema.prisma" "$(DATABASE_URL="$U" DIRECT_URL="$U" npx --prefix "$ROOT" prisma migrate diff --from-url "$U" --to-schema-datamodel "$ROOT/prisma/schema.prisma" --exit-code >/dev/null 2>&1; echo "exit=$?")" "exit=0"

echo "== a failing migration changes nothing"
DBF=drinkserver_migration_fail; UF=$(url_for $DBF)
fresh $DBF
run "$UF" -f "$M/0_init/migration.sql"
run "$UF" -c "$LEGACY_DATA"
# An order whose user does not exist makes the foreign key step fail.
run "$UF" -c "insert into \"Order\"(\"orderId\",\"userId\",username,itemid,itemname,itemprice,date,status) values ('orphan','nobody','x','i1','Mate',1,now(),'PENDING')"
check "migration 1 fails on bad data" "$(run "$UF" -f "$M/1_money_cents_relations_payments_tokens/migration.sql" 2>&1)" "Order_userId_fkey"
check "old schema intact after failure" "$("$PSQL" "$UF" -At -c "select count(*) from information_schema.columns where table_name='Order' and column_name='itemprice'")/$("$PSQL" "$UF" -At -c "select count(*) from information_schema.tables where table_name='Payment'")" "1/0"

"$PSQL" "$ADMIN" -q -c "drop database if exists $DB" -c "drop database if exists $DBF"
echo "---- $pass passed, $fail failed"
[[ $fail -eq 0 ]]
