#!/usr/bin/env bash
# End-to-end checks against a running app and its (local!) database.
#
#   DATABASE_URL=postgresql://<you>@localhost:5432/drinkserver_dev tests/integration.sh
#
# Start the app first (npm run dev, or npm run build && npm start) with the
# same DATABASE_URL. The script DELETES all orders, payments and rate-limit
# counters and reseeds the test data, so it refuses non-local databases.
# Options: BASE_URL (default http://localhost:3000), PSQL (default psql).
set -uo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
B="${BASE_URL:-http://localhost:3000}"
PSQL="${PSQL:-psql}"
DB="${DATABASE_URL:?set DATABASE_URL to the local test database}"

host=$(echo "$DB" | sed -E 's#^[a-z]+://([^@/]*@)?([^:/?]+).*#\2#')
case "$host" in
    localhost|127.0.0.1) ;;
    *) echo "Refusing to run: DATABASE_URL points at non-local host '$host'." >&2; exit 1 ;;
esac

T=$(mktemp -d)
q(){ "$PSQL" "$DB" -At -v ON_ERROR_STOP=1 -c "$1"; }
cleanup(){
    # Undo temporary changes even if the run is interrupted.
    q "alter table if exists \"RateLimit_off\" rename to \"RateLimit\"" >/dev/null 2>&1
    q "update \"User\" set role='ADMIN' where email='admin@test.local'" >/dev/null 2>&1
    q "delete from \"User\" where id='tmp-admin'" >/dev/null 2>&1
    rm -rf "$T"
}
trap cleanup EXIT

pass=0; fail=0
check(){ if [[ "$2" == *"$3"* ]]; then echo "PASS  $1"; pass=$((pass+1)); else echo "FAIL  $1 -> got: ${2:0:200}"; fail=$((fail+1)); fi; }
json(){ node -e 'let s="";process.stdin.on("data",d=>s+=d).on("end",()=>console.log(JSON.parse(s)[process.argv[1]]))' "$1"; }
# login <email> <jar> [password]: signs in through the Auth.js credentials endpoint.
login(){
    rm -f "$T/$2"
    local csrf; csrf=$(curl -s -c "$T/$2" -b "$T/$2" "$B/api/auth/csrf" | json csrfToken)
    curl -s -o /dev/null -c "$T/$2" -b "$T/$2" -X POST "$B/api/auth/callback/credentials" \
        --data-urlencode "csrfToken=$csrf" --data-urlencode "email=$1" --data-urlencode "password=${3:-password123}"
    curl -s -b "$T/$2" "$B/api/auth/session"
}
# body <jar> <path>: page HTML, or a marker if the server streamed an error.
body(){ local b; b=$(curl -s -b "$T/$1" "$B$2"); if [[ "$b" == *'"digest":"'[0-9]* ]]; then echo "SERVER ERROR IN RESPONSE"; else echo "$b"; fi; }
st(){ curl -s -o /dev/null -w "%{http_code} %{redirect_url}" -b "$T/$1" "$B$2"; }
# actr <jar|-> <page> <action id> <json args>: calls a server action; prints status and result.
actr(){
    local jar=(); [[ "$1" != "-" ]] && jar=(-b "$T/$1")
    local out; out=$(curl -s -w "\n%{http_code} %{redirect_url}" ${jar[@]+"${jar[@]}"} -X POST "$B$2" -H "Next-Action: $3" \
        -H "Content-Type: text/plain;charset=UTF-8" -H "Accept: text/x-component" --data "$4")
    echo "$out" | tail -1; echo "$out" | grep -o '1:{.*'
}

echo "== setup"
q 'delete from "Order"; delete from "Payment"; delete from "RateLimit"; delete from "PasswordResetToken"; delete from "VerificationToken"' >/dev/null
q "update \"User\" set achievements='{}', \"passwordChangedAt\"=null" >/dev/null
DEV_DATABASE_URL="$DB" node "$ROOT/prisma/seed-dev.mjs" | head -1
for u in user user2 admin; do login "$u@test.local" "$u.jar" >/dev/null; done
# Visit the pages once so a dev server compiles them and registers their actions.
for p in /drinks /admin /auth/login /auth/reset /auth/register /auth/new-password; do st admin.jar "$p" >/dev/null; curl -s -o /dev/null "$B$p"; done
aid(){ node -e 'const m=require(process.argv[1]).node; console.log(Object.keys(m).find(k=>m[k].exportedName===process.argv[2]) ?? "")' "$ROOT/.next/server/server-reference-manifest.json" "$1"; }
ORDER=$(aid order); PAY=$(aid recordPayment); LOGIN=$(aid login); RESET=$(aid reset); NEWPW=$(aid newPassword); REGISTER=$(aid register)
for a in ORDER PAY LOGIN RESET NEWPW REGISTER; do [[ -n "${!a}" ]] || { echo "server action $a not found in the build manifest" >&2; exit 1; }; done

CLUB=$(q "select itemid from \"Item\" where itemname='Club Mate'"); LAST=$(q "select itemid from \"Item\" where itemname='Last One'")
FRITZ=$(q "select itemid from \"Item\" where itemname='Fritz Kola'")
U1=$(q "select id from \"User\" where email='user@test.local'"); U2=$(q "select id from \"User\" where email='user2@test.local'")

echo "== access"
check "session has id+role"      "$(curl -s -b "$T/admin.jar" "$B/api/auth/session")" '"role":"ADMIN"'
check "anon /admin -> login"     "$(curl -s -o /dev/null -w '%{http_code} %{redirect_url}' "$B/admin")" "302 $B/auth/login"
check "user /admin -> drinks"    "$(st user.jar /admin)" "302 $B/drinks"
check "user /drinks renders"     "$(body user.jar /drinks)" "in stock"
check "user /dashboard renders"  "$(body user.jar /dashboard)" "Manage your orders"
check "user /stats renders (no orders)" "$(body user.jar /stats)" "Understand your patterns"
check "admin /admin renders"     "$(body admin.jar /admin)" "Second User"
for r in add-order add-item authorize-user clear-user-orders money-spend; do
  check "removed /api/$r is 404" "$(st admin.jar "/api/$r?userId=$U1")" "404"
done

echo "== ordering"
check "order()"                  "$(actr user.jar /drinks "$ORDER" "[\"$CLUB\"]")" "Test User ordered Club Mate"
check "order() spoof uid"        "$(actr user.jar /drinks "$ORDER" "[\"$CLUB\",\"$U2\"]")" "Test User ordered"
check "spoofed order charged to caller" "$(q "select count(*) from \"Order\" where \"userId\"='$U2'")" "0"
check "order() unknown item"     "$(actr user.jar /drinks "$ORDER" '["nope"]')" "Item not found"
check "order() no arg"           "$(actr user.jar /drinks "$ORDER" '[]')" "Item not found"
check "anon order() redirected"  "$(actr - /drinks "$ORDER" "[\"$CLUB\"]")" "302 $B/auth/login"
check "order stores nutrition"   "$(q "select string_agg(distinct o.sugar||'/'||o.caffeine, ',') from \"Order\" o where o.itemid='$CLUB'")" "25/100"
# Achievements are awarded after the response, so wait for them.
awarded=f; for _ in $(seq 1 20); do [[ "$(q "select coalesce(array_length(achievements,1),0) > 0 from \"User\" where id='$U1'")" == t ]] && { awarded=t; break; }; sleep 0.5; done
check "achievement awarded after purchase" "$awarded" "t"
check "user2 orders Fritz"       "$(actr user2.jar /drinks "$ORDER" "[\"$FRITZ\"]")" "Second User ordered"
# Race: 10 concurrent orders for the last item in stock.
for i in 1 2 3 4 5; do actr user.jar /drinks "$ORDER" "[\"$LAST\"]" > "$T/r_u$i" & actr user2.jar /drinks "$ORDER" "[\"$LAST\"]" > "$T/r_v$i" & done; wait
check "race: 1 success"          "$(cat "$T"/r_* | grep -o 'ordered Last One' | wc -l | tr -d ' ')" "1"
check "race: 9 out of stock"     "$(cat "$T"/r_* | grep -o 'out of stock' | wc -l | tr -d ' ')" "9"
check "race: stock 0, 1 order"   "$(q "select quantity from \"Item\" where itemid='$LAST'")/$(q "select count(*) from \"Order\" where itemid='$LAST'")" "0/1"
check "DB refuses negative stock" "$(q "update \"Item\" set quantity=-1 where itemid='$LAST'" 2>&1)" "Item_quantity_nonnegative"
check "DB refuses negative price" "$(q "update \"Item\" set \"priceCents\"=-1 where itemid='$LAST'" 2>&1)" "Item_priceCents_nonnegative"
check "sold-out item hidden"     "$(body user.jar /drinks | grep -c 'bgAfri-Cola')" "0"
q "update \"Item\" set quantity=1 where itemid='$LAST'" >/dev/null
check "restocked item shown"     "$(body user.jar /drinks | grep -c 'bgAfri-Cola')" "1"

echo "== stats"
SUGAR_BEFORE=$(q "select to_char(sum(sugar)/1000.0, 'FM0.00') from \"Order\" where \"userId\"='$U1' and status<>'CANCELLED'")
q "update \"Item\" set sugar=100000 where itemid='$CLUB'" >/dev/null
check "stats use sugar at purchase time" "$(body user.jar /stats | sed 's/<!-- -->//g' | grep -o ">$SUGAR_BEFORE<" | head -1)" ">$SUGAR_BEFORE<"
q "update \"Item\" set sugar=25 where itemid='$CLUB'" >/dev/null

echo "== admin / payments"
check "admin page count = DB"    "$(body admin.jar /admin | sed 's/<!-- -->//g' | grep -oE "$U2\)</p><p>Orders pending: [0-9]+")" "Orders pending: $(q "select count(*) from \"Order\" where status='PENDING' and \"userId\"='$U2'")"
check "dashboard shows cents as euros" "$(body user.jar /dashboard | sed 's/<!-- -->//g')" "1.50"
# The snapshot the admin page would send for user 1.
snapshot(){ q "select format('{\"count\":%s,\"cents\":%s,\"latest\":\"%s\"}', count(*), coalesce(sum(\"priceCents\"),0), to_char(max(date), 'YYYY-MM-DD\"T\"HH24:MI:SS.MS\"Z\"')) from \"Order\" where status='PENDING' and \"userId\"='$1'"; }
S1=$(snapshot "$U1"); C1=$(q "select sum(\"priceCents\") from \"Order\" where status='PENDING' and \"userId\"='$U1'"); N1=$(q "select count(*) from \"Order\" where status='PENDING' and \"userId\"='$U1'")
check "user recordPayment blocked" "$(actr user.jar /admin "$PAY" "[\"$U1\",$S1,$C1]")" "302 $B/drinks"
check "recordPayment bad snapshot" "$(actr admin.jar /admin "$PAY" "[\"$U1\",{\"count\":0,\"cents\":0,\"latest\":\"x\"},100]")" "Invalid payment details"
check "recordPayment bad amount" "$(actr admin.jar /admin "$PAY" "[\"$U1\",$S1,-5]")" "Enter an amount"
check "underpayment refused"     "$(actr admin.jar /admin "$PAY" "[\"$U1\",$S1,$((C1 - 1))]")" "does not cover"
check "zero payment refused"     "$(actr admin.jar /admin "$PAY" "[\"$U1\",$S1,0]")" "does not cover"
check "wrong user's snapshot refused" "$(actr admin.jar /admin "$PAY" "[\"$U2\",$S1,$C1]")" "changed in the meantime"
q "update \"User\" set role='USER' where email='admin@test.local'" >/dev/null
check "demoted admin recordPayment 403" "$(actr admin.jar /admin "$PAY" "[\"$U1\",$S1,$C1]")" '"code":403'
q "update \"User\" set role='ADMIN' where email='admin@test.local'" >/dev/null
check "no payment yet"           "$(q 'select count(*) from "Payment"')/$(q "select count(*) from \"Order\" where status='COMPLETED'")" "0/0"
# An order placed after the admin loaded the page must stay pending.
sleep 0.01; actr user.jar /drinks "$ORDER" "[\"$CLUB\"]" >/dev/null
LATE=$(q "select \"orderId\" from \"Order\" where \"userId\"='$U1' order by date desc limit 1")
for i in 1 2 3 4 5; do actr admin.jar /admin "$PAY" "[\"$U1\",$S1,$C1,\"PP-REF-1\"]" > "$T/pay$i" & done; wait
check "concurrent record: 1 success" "$(cat "$T"/pay* | grep -o 'Payment recorded' | wc -l | tr -d ' ')" "1"
check "concurrent record: 1 payment row" "$(q 'select count(*) from "Payment"')" "1"
check "payment row matches"      "$(q "select \"amountCents\"||'/'||\"ordersCents\"||'/'||reference||'/'||(select count(*) from \"Order\" o where o.\"paymentId\"=p.id) from \"Payment\" p")" "$C1/$C1/PP-REF-1/$N1"
check "late order still pending" "$(q "select status from \"Order\" where \"orderId\"='$LATE'")" "PENDING"
check "user2 orders untouched"   "$(q "select count(*) from \"Order\" where status<>'PENDING' and \"userId\"='$U2'")" "0"
check "same snapshot again refused" "$(actr admin.jar /admin "$PAY" "[\"$U1\",$S1,$C1]")" "changed in the meantime"
check "overpayment recorded"     "$(actr admin.jar /admin "$PAY" "[\"$U1\",$(snapshot "$U1"),200]")" "0.50 more than"
check "admin page lists payments" "$(body admin.jar /admin | sed 's/<!-- -->//g')" "Ref: PP-REF-1"
check "stats renders (with orders)" "$(body user.jar /stats)" "Understand your patterns"
check "dashboard renders (with orders)" "$(body user2.jar /dashboard)" "Fritz Kola"

echo "== sessions"
q "insert into \"User\"(id,name,email,\"emailVerified\",authorized,password,role,achievements) select 'tmp-admin','Temp Admin','tmp-admin@test.local',now(),true,password,'ADMIN','{}' from \"User\" where email='admin@test.local'" >/dev/null
check "temp admin signs in"      "$(login tmp-admin@test.local tmp.jar)" '"role":"ADMIN"'
check "temp admin sees admin page" "$(body tmp.jar /admin)" "Recent payments"
q "delete from \"User\" where id='tmp-admin'" >/dev/null
check "deleted user: session ends" "$(curl -s -b "$T/tmp.jar" "$B/api/auth/session")" "null"
check "deleted admin: no admin data" "$(body tmp.jar /admin | grep -c 'Recent payments')" "0"

echo "== auth"
check "login wrong pw"           "$(actr - /auth/login "$LOGIN" '[{"email":"user@test.local","password":"wrong"}]')" "Invalid email or password"
check "login unknown email same msg" "$(actr - /auth/login "$LOGIN" '[{"email":"nobody@test.local","password":"x"}]')" "Invalid email or password"
q "update \"User\" set \"emailVerified\"=null where email='user2@test.local'" >/dev/null
check "unverified + wrong pw: no mail" "$(actr - /auth/login "$LOGIN" '[{"email":"user2@test.local","password":"wrong"}]')" "Invalid email or password"
check "no verification token made" "$(q "select count(*) from \"VerificationToken\" where email='user2@test.local'")" "0"
q "update \"User\" set \"emailVerified\"=now() where email='user2@test.local'" >/dev/null
check "register existing email: generic answer" "$(actr - /auth/register "$REGISTER" '[{"email":"user@test.local","password":"whatever1","name":"X"}]')" "Confirmation email sent"
check "register existing email: no new account" "$(q "select count(*) from \"User\" where email='user@test.local'")" "1"
R_KNOWN=$(actr - /auth/reset "$RESET" '[{"email":"user@test.local"}]' | grep -o '"success":"[^"]*"')
R_UNKNOWN=$(actr - /auth/reset "$RESET" '[{"email":"nobody@test.local"}]' | grep -o '"success":"[^"]*"')
check "reset: same response"     "$([[ -n "$R_KNOWN" && "$R_KNOWN" == "$R_UNKNOWN" ]] && echo same || echo "differs: $R_KNOWN | $R_UNKNOWN")" "same"
check "reset stores only a hash" "$(q "select count(*) filter (where \"tokenHash\" ~ '^[0-9a-f]{64}$')||'/'||count(*) from \"PasswordResetToken\" where email='user@test.local'")" "1/1"
# Concurrent use of one reset token: exactly one password change.
q 'delete from "PasswordResetToken"' >/dev/null
q "insert into \"PasswordResetToken\"(id,email,\"tokenHash\",expires) values ('t1','user2@test.local',encode(sha256('race-token'),'hex'),now()+interval '1 hour')" >/dev/null
for i in 1 2 3 4 5; do actr - /auth/new-password "$NEWPW" "[{\"password\":\"newpass$i\"},\"race-token\"]" > "$T/pw$i" & done; wait
check "reset race: 1 success"    "$(cat "$T"/pw* | grep -o 'Password updated' | wc -l | tr -d ' ')" "1"
check "reset race: token consumed" "$(q 'select count(*) from "PasswordResetToken"')" "0"
check "old session signed out"   "$(curl -s -b "$T/user2.jar" "$B/api/auth/session")" "null"
check "old session loses pages"  "$(curl -s -b "$T/user2.jar" "$B/dashboard" | grep -o 'NEXT_REDIRECT;replace;/auth/login' | head -1)" "NEXT_REDIRECT;replace;/auth/login"
q "update \"User\" set password=(select password from \"User\" where email='user@test.local') where email='user2@test.local'" >/dev/null
check "new login after reset ok" "$(login user2@test.local user2b.jar)" "user2@test.local"

echo "== rate limits"
q 'delete from "RateLimit"' >/dev/null
for i in $(seq 1 10); do actr - /auth/login "$LOGIN" '[{"email":"user@test.local","password":"wrong"}]' >/dev/null; done
check "11th login attempt limited" "$(actr - /auth/login "$LOGIN" '[{"email":"user@test.local","password":"wrong"}]')" "Too many attempts"
check "direct callback also limited" "$(csrf=$(curl -s -c "$T/rl.jar" "$B/api/auth/csrf" | json csrfToken); curl -s -o /dev/null -w '%{redirect_url}' -b "$T/rl.jar" -X POST "$B/api/auth/callback/credentials" --data-urlencode "csrfToken=$csrf" --data-urlencode email=user@test.local --data-urlencode password=password123)" "code=rate_limited"
check "other account not limited" "$(actr - /auth/login "$LOGIN" '[{"email":"admin@test.local","password":"wrong"}]')" "Invalid email or password"
q 'delete from "RateLimit"' >/dev/null
q "update \"User\" set \"emailVerified\"=null where email='user2@test.local'" >/dev/null
for i in $(seq 1 10); do actr - /auth/login "$LOGIN" '[{"email":"user2@test.local","password":"wrong"}]' >/dev/null; done
check "unverified account: 11th attempt limited" "$(actr - /auth/login "$LOGIN" '[{"email":"user2@test.local","password":"wrong"}]')" "Too many attempts"
q "update \"User\" set \"emailVerified\"=now() where email='user2@test.local'" >/dev/null
for i in 1 2 3; do actr - /auth/reset "$RESET" '[{"email":"admin@test.local"}]' >/dev/null; done
check "4th reset request limited" "$(actr - /auth/reset "$RESET" '[{"email":"admin@test.local"}]')" "Too many attempts"
q 'delete from "RateLimit"' >/dev/null
q 'alter table "RateLimit" rename to "RateLimit_off"' >/dev/null
check "limiter failure refuses login" "$(actr - /auth/login "$LOGIN" '[{"email":"admin@test.local","password":"password123"}]')" "Too many attempts"
q 'alter table "RateLimit_off" rename to "RateLimit"' >/dev/null
rm -f "$T/la.jar"
curl -s -o /dev/null -c "$T/la.jar" -X POST "$B/auth/login" -H "Next-Action: $LOGIN" -H "Content-Type: text/plain;charset=UTF-8" -H "Accept: text/x-component" --data '[{"email":"user@test.local","password":"password123"}]'
check "login action sets session" "$(curl -s -b "$T/la.jar" "$B/api/auth/session")" '"email":"user@test.local"'

echo "---- $pass passed, $fail failed"
[[ $fail -eq 0 ]]
