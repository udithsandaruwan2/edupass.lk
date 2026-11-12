#!/usr/bin/env bash
# End-to-end API smoke for pre-PayHere edupass.lk (matches commerce/playwright routes).
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
BASE="${API_BASE_URL:-http://127.0.0.1:3000}"
API="${BASE%/}/api"
fail=0
ok() { echo "OK  $*"; }
bad() { echo "FAIL $*"; fail=$((fail + 1)); }

jget() { python3 -c "import sys,json; d=json.load(sys.stdin); print($1)"; }

# prints: HTTP_CODE\nBODY
req() {
  local method=$1 path=$2 token=${3:-} data=${4:-}
  local args=(-sS -w "\n%{http_code}" -X "$method" "${API}${path}" -H 'content-type: application/json')
  [[ -n "$token" ]] && args+=(-H "authorization: Bearer $token")
  [[ -n "$data" ]] && args+=(-d "$data")
  curl "${args[@]}"
}

split() {
  CODE=$(printf '%s' "$1" | tail -n1)
  BODY=$(printf '%s' "$1" | sed '$d')
}

expect() {
  local got=$1 want=$2 label=$3
  if [[ "$got" == "$want" ]]; then ok "$label ($got)"; else bad "$label (got $got want $want)"; fi
}

TS=$(date +%s)
PASS='Password123!'
STARTS=$(python3 -c "from datetime import datetime,timedelta,timezone; print((datetime.now(timezone.utc)+timedelta(days=14)).strftime('%Y-%m-%dT%H:%M:%S.000Z'))")

echo "== health =="
H=$(curl -sf "$API/health" || true)
[[ "$H" == *'"status":"ok"'* ]] && ok "health" || bad "health"

echo "== register student / institution / lecturer =="
OUT=$(req POST /auth/register/student "" "{\"email\":\"smoke-stu-${TS}@edupass.test\",\"password\":\"$PASS\",\"name\":\"Smoke Student\",\"district\":\"Colombo\",\"school\":\"Smoke HS\"}")
split "$OUT"; expect "$CODE" 201 "register student"
STU_TOKEN=$(printf '%s' "$BODY" | jget "d['accessToken']")

OUT=$(req POST /auth/register/institution "" "{\"email\":\"smoke-inst-${TS}@edupass.test\",\"password\":\"$PASS\",\"name\":\"Inst Owner\",\"organisationName\":\"Smoke Institute ${TS}\"}")
split "$OUT"; expect "$CODE" 201 "register institution"
INST_TOKEN=$(printf '%s' "$BODY" | jget "d['accessToken']")
INST_ORG=$(printf '%s' "$BODY" | jget "d['user']['memberships'][0]['organisationId']")

OUT=$(req POST /auth/register/lecturer "" "{\"email\":\"smoke-lect-${TS}@edupass.test\",\"password\":\"$PASS\",\"name\":\"Solo Lect\",\"organisationName\":\"Smoke Lect ${TS}\"}")
split "$OUT"; expect "$CODE" 201 "register lecturer"
LECT_TOKEN=$(printf '%s' "$BODY" | jget "d['accessToken']")
LECT_ORG=$(printf '%s' "$BODY" | jget "d['user']['memberships'][0]['organisationId']")

echo "== login + forgot-password =="
OUT=$(req POST /auth/login "" "{\"email\":\"smoke-stu-${TS}@edupass.test\",\"password\":\"$PASS\"}")
split "$OUT"; expect "$CODE" 201 "login student"
OUT=$(req POST /auth/forgot-password "" "{\"email\":\"smoke-stu-${TS}@edupass.test\"}")
split "$OUT"; expect "$CODE" 201 "forgot-password"

echo "== seminar create + publish =="
OUT=$(req POST /organiser/seminars "$LECT_TOKEN" "{\"organisationId\":\"$LECT_ORG\",\"title\":\"Smoke Seminar ${TS}\",\"subject\":\"Economics\",\"level\":\"AL\",\"mode\":\"PHYSICAL\",\"venue\":\"Hall A\",\"district\":\"Colombo\",\"startsAt\":\"$STARTS\",\"durationHours\":3,\"summary\":\"Summary long enough for smoke seminar create.\",\"description\":\"Desc\",\"ticketTypes\":[{\"name\":\"Standard\",\"description\":\"Seat\",\"priceLkr\":1500,\"capacity\":50}]}")
split "$OUT"; expect "$CODE" 201 "create seminar"
SEM_ID=$(printf '%s' "$BODY" | jget "d['id']")
TT=$(printf '%s' "$BODY" | jget "d['ticketTypes'][0]['id']")

OUT=$(req POST "/organiser/seminars/${SEM_ID}/publish?organisationId=${LECT_ORG}" "$LECT_TOKEN" '{"checkInMode":"QR_GATE"}')
split "$OUT"; expect "$CODE" 201 "publish seminar"

OUT=$(req GET /seminars "" "")
split "$OUT"; expect "$CODE" 200 "public catalogue"

echo "== bank checkout → slip → tickets → check-in =="
OUT=$(req POST /checkout "$STU_TOKEN" "{\"paymentMethod\":\"BANK_TRANSFER\",\"buyer\":{\"name\":\"Smoke Student\",\"email\":\"smoke-stu-${TS}@edupass.test\",\"phone\":\"0771234567\"},\"lines\":[{\"ticketTypeId\":\"$TT\",\"quantity\":1}]}")
split "$OUT"; expect "$CODE" 201 "checkout"
ORDER_ID=$(printf '%s' "$BODY" | jget "d['id']")
STATUS=$(printf '%s' "$BODY" | jget "d['status']")
[[ "$STATUS" == "AWAITING_SLIP" ]] && ok "order awaiting slip" || bad "order status $STATUS"

OUT=$(req GET "/checkout/${ORDER_ID}/bank-instructions" "$STU_TOKEN" "")
split "$OUT"; expect "$CODE" 200 "bank instructions"

OUT=$(req POST /payments/slips "$STU_TOKEN" "{\"orderId\":\"$ORDER_ID\",\"slipReference\":\"SMOKE-${TS}\"}")
split "$OUT"; expect "$CODE" 201 "upload slip"
SLIP_ID=$(printf '%s' "$BODY" | jget "d['id']")

OUT=$(req PATCH "/organiser/payments/slips/${SLIP_ID}?organisationId=${LECT_ORG}" "$LECT_TOKEN" '{"action":"approve"}')
split "$OUT"; expect "$CODE" 200 "approve slip"

OUT=$(req GET /tickets "$STU_TOKEN" "")
split "$OUT"; expect "$CODE" 200 "list tickets"
TICKET_CODE=$(printf '%s' "$BODY" | jget "next((t['code'] for t in d if t.get('seminarId')=='$SEM_ID'), '')")
[[ -n "$TICKET_CODE" ]] && ok "ticket $TICKET_CODE" || bad "ticket missing"

OUT=$(req POST /organiser/check-in "$LECT_TOKEN" "{\"organisationId\":\"$LECT_ORG\",\"seminarId\":\"$SEM_ID\",\"code\":\"$TICKET_CODE\"}")
split "$OUT"; expect "$CODE" 200 "check-in"
RESULT=$(printf '%s' "$BODY" | jget "d.get('result','')")
[[ "$RESULT" == "ADMITTED" ]] && ok "admitted" || bad "check-in result $RESULT"

OUT=$(req POST /organiser/check-in "$LECT_TOKEN" "{\"organisationId\":\"$LECT_ORG\",\"seminarId\":\"$SEM_ID\",\"code\":\"$TICKET_CODE\"}")
split "$OUT"
# second scan should not admit again
if [[ "$CODE" == "200" ]]; then
  R2=$(printf '%s' "$BODY" | jget "d.get('result','')")
  if [[ "$R2" == "ADMITTED" ]]; then bad "second check-in admitted again"; else ok "admit-once ($R2)"; fi
elif [[ "$CODE" == "409" || "$CODE" == "400" ]]; then
  ok "admit-once ($CODE)"
else
  bad "second check-in unexpected $CODE"
fi

echo "== institute ops =="
OUT=$(req POST /institute/batches "$INST_TOKEN" "{\"organisationId\":\"$INST_ORG\",\"name\":\"Smoke Batch ${TS}\"}")
split "$OUT"; expect "$CODE" 201 "create batch"

OUT=$(req POST /institute/batches "$LECT_TOKEN" "{\"organisationId\":\"$LECT_ORG\",\"name\":\"Should Fail\"}")
split "$OUT"; expect "$CODE" 403 "lecturer institute blocked"

echo "== tuition fee plan =="
OUT=$(req POST /institute/tuition/fee-plans "$INST_TOKEN" "{\"organisationId\":\"$INST_ORG\",\"name\":\"Monthly Class ${TS}\",\"amountLkr\":2500}")
split "$OUT"; expect "$CODE" 201 "tuition fee plan"

echo "== organiser orders list =="
OUT=$(req GET "/organiser/orders?organisationId=${LECT_ORG}" "$LECT_TOKEN" "")
split "$OUT"; expect "$CODE" 200 "organiser orders"
COUNT=$(printf '%s' "$BODY" | jget "len(d)")
[[ "$COUNT" -ge 1 ]] && ok "organiser sees $COUNT order(s)" || bad "organiser orders empty"

echo "== admin revenue =="
OUT=$(req POST /auth/login "" '{"email":"admin@edupass.lk","password":"Password123!"}')
split "$OUT"
ADMIN_TOKEN=$(printf '%s' "$BODY" | jget "d.get('accessToken','')" 2>/dev/null || true)
if [[ -n "${ADMIN_TOKEN:-}" ]]; then
  expect "$CODE" 201 "admin login"
  OUT=$(req GET /admin/revenue/platform-fees "$ADMIN_TOKEN" "")
  split "$OUT"; expect "$CODE" 200 "platform fees"
  OUT=$(req GET /admin/revenue/subscriptions "$ADMIN_TOKEN" "")
  split "$OUT"; expect "$CODE" 200 "subscription invoices"
else
  bad "admin login"
fi

echo "== card still disabled =="
OUT=$(req POST /checkout "$STU_TOKEN" "{\"paymentMethod\":\"CARD\",\"buyer\":{\"name\":\"X\",\"email\":\"x@test.lk\",\"phone\":\"077\"},\"lines\":[{\"ticketTypeId\":\"$TT\",\"quantity\":1}]}")
split "$OUT"
if [[ "$CODE" == "400" || "$CODE" == "501" ]]; then ok "card blocked ($CODE)"; else bad "card should be blocked ($CODE)"; fi

echo
if [[ "$fail" -eq 0 ]]; then
  echo "SMOKE PASS"
  exit 0
fi
echo "SMOKE FAIL ($fail)"
exit 1
