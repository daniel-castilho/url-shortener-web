#!/bin/bash
set -euo pipefail
API_BASE="${API_BASE:-http://localhost:8080}"
DEMO_PASSWORD="${DEMO_PASSWORD:-password123}"

USER_EMAIL="demo@example.com"
ADMIN_EMAIL="${APP_ADMIN_EMAILS:-}"

say() { printf '\n\033[1;34m==> %s\033[0m\n' "$*"; }
ok() { printf '\033[0;32m    %s\033[0m\n' "$*"; }

register() { 
  local name="$1" email="$2"
  local resp code
  resp="$(
    curl -sS -o /tmp/seed-body.json -w '%{http_code}' \
     -H 'Content-Type: application/json' \
     -d "{\"name\":\"$name\",\"email\":\"$email\",\"password\":\"$DEMO_PASSWORD\"}" \
     "$API_BASE/api/v1/auth/register" || true
  )"
  code="${resp}"
  if [ "$code" = "200" ]; then
    ok "registered $email"
    python3 -c 'import json;print(json.load(open("/tmp/seed-body.json"))["token"])'
  elif [ "$code" = "400" ] && grep -q "EMAIL_IN_USE\|already" /tmp/seed-body.json 2>/dev/null; then
    ok "$email already registered (reusing)"
    code=$(curl -sS -o /tmp/seed-body.json -w '%{http_code}' \
      -H 'Content-Type: application/json' \
      -d "{\"email\":\"$email\",\"password\":\"$DEMO_PASSWORD\"}" \
      "$API_BASE/api/v1/auth/login") || true
    if [ "$code" = "200" ]; then
      python3 -c 'import json;print(json.load(open("/tmp/seed-body.json"))["token"])'
    else
      echo "ERROR: login for $email failed (HTTP $code)" >&2
      exit 1
    fi
  else
    echo "ERROR: seeding $email failed (HTTP $code): $(cat /tmp/seed-body.json 2>/dev/null || true)" >&2
    exit 1
  fi
}

shorten() {
  local alias="$1" url="$2" ttl="${3:-}" token="$4"
  local body="{\"originalUrl\":\"$url\",\"customAlias\":\"$alias\""
  [ -n "$ttl" ] && body="$body,\"ttlSeconds\":$ttl"
  body="$body}"
  local code
  code=$(curl -sS -o /tmp/seed-body.json -w '%{http_code}' \
    -H 'Content-Type: application/json' \
    -H "Authorization: Bearer $token" \
    -d "$body" \
    "$API_BASE/api/v1/urls" || true)
  if [ "$code" = "200" ]; then
    local short_url
    short_url=$(python3 -c 'import json;print(json.load(open("/tmp/seed-body.json"))["shortUrl"])' 2>/dev/null || echo "$alias")
    ok "$short_url"
  elif [ "$code" = "409" ]; then
    ok "$alias already exists (skipped)"
  else
    echo "ERROR: shortening $alias failed (HTTP $code): $(cat /tmp/seed-body.json 2>/dev/null || true)" >&2
    exit 1
  fi
}

main() {
  say() { printf '\n\033[1;34m==> %s\033[0m\n' "$*"; }
  ok() { printf '\033[0;32m    %s\033[0m\n' "$*"; }

  curl -fsS "$API_BASE/actuator/health/liveness" >/dev/null \
    || { echo "ERROR: backend not reachable at $API_BASE" >&2; exit 1; }

  say "Seeding demo user"
  USER_TOKEN="$(register "E2E Demo User" "demo@example.com")"

  if [ -n "$ADMIN_EMAIL" ]; then
    say "Seeding admin user ($ADMIN_EMAIL)"
    ADMIN_TOKEN="$(register "E2E Admin" "$ADMIN_EMAIL")"
  fi

  say "Seeding sample links (demo user) - using aliases >= 8 chars for FREE plan"
  # Use aliases >= 8 chars for FREE plan minimum
  shorten "docs-page"   "https://example.com/documentation"   ""    "$USER_TOKEN"
  shorten "blog-launch" "https://example.com/blog/launch"     ""    "$USER_TOKEN"
  shorten "limited-time" "https://example.com/limited-time"   36000 "$USER_TOKEN"

  say "Seed complete."
  ok "demo user:   demo@example.com / password123"
  [ -n "$ADMIN_EMAIL" ] && ok "admin user:  $ADMIN_EMAIL / password123"
  ok "sample links: /docs-page /blog-launch /limited-time"
}

main "$@"
