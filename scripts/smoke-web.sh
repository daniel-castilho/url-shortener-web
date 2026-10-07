#!/usr/bin/env bash
#
# Read-only verification of the deployed SPA through the production edge (the
# compose routing law). Auto-detects the edge state:
#
#   * PRE-DNS (no certificate yet): spins up a THROWAWAY Caddy with
#     `tls internal` on 8081/8443 attached to the compose network (never
#     touches the live edge or its ports); the law variant is generated from
#     the backend's deploy/compose/Caddyfile on the host (contract).
#   * POST-DNS (Let's Encrypt cert live): runs against 127.0.0.1:443 via
#     --resolve so no hairpin NAT is needed.
#
# All legs are READ-ONLY: no shorten, no `GET /{id}` redirect (that would
# insert a click_event). The smoke asserts routing-law behavior + artifact
# integrity only.
#
#   bash scripts/smoke-web.sh
#   bash scripts/smoke-web.sh --expect-version v0.3.0
#   bash scripts/smoke-web.sh --self-test
set -euo pipefail

FRONTEND_DIR="${FRONTEND_DIR:-/home/daniel/projects/urlshortener/frontend}"
BACKEND_COMPOSE_DIR="${BACKEND_COMPOSE_DIR:-/home/daniel/projects/urlshortener/url-shortener-service}"
EDGE_CA_DIR="$BACKEND_COMPOSE_DIR/deploy/compose/Caddyfile"
CADDY_IMAGE="${CADDY_IMAGE:-caddy:2-alpine}"
SMOKE_HTTP_PORT="${SMOKE_HTTP_PORT:-8081}"
SMOKE_HTTPS_PORT="${SMOKE_HTTPS_PORT:-8443}"
SHORTCODE_SAMPLE="${SHORTCODE_SAMPLE:-vvvvvvv9}" # len-7, not reserved, not present in prod DB

log() { printf '[smoke-web %s] %s\n' "$(date +%H:%M:%S)" "$*"; }
fail() { echo "FATAL: $*" >&2; exit 1; }

usage() {
  sed -n '8,21p' "$0" | sed 's/^# \{0,1\}//'
}

MODES_FAILS=0
ok() { printf '  %-34s OK\n' "$1"; }
bad() { printf '  %-34s FAIL: %s\n' "$1" "$2"; MODES_FAILS=$((MODES_FAILS + 1)); }

# --- artifact-level checks (filesystem, no network) --------------------------
artifact_checks() {
  local want="$1" cur rel
  log "artifact checks (FRONTEND_DIR=$FRONTEND_DIR)"
  [ -L "$FRONTEND_DIR/current" ] || bad "current symlink" "missing at $FRONTEND_DIR/current"
  cur="$(readlink "$FRONTEND_DIR/current" 2>/dev/null || echo missing)"
  [ -d "$FRONTEND_DIR/$cur" ] || bad "current release dir" "$cur missing"
  [ -f "$FRONTEND_DIR/$cur/index.html" ] || bad "current index.html" "missing"
  [ -n "$want" ] || { bad "expect-version" "no --expect-version given"; return; }
  rel="$(cat "$FRONTEND_DIR/$cur/VERSION" 2>/dev/null || echo missing)"
  [ "$rel" = "$want" ] || bad "VERSION == $want" "got '$rel' (current -> $cur)"
  [ "$(cat "$FRONTEND_DIR/current/VERSION" 2>/dev/null)" = "$want" ] || bad "current/VERSION" "not $want"
  ok "artifact integrity (current -> $cur, version $want)"
}

# --- edge selection -----------------------------------------------------------
detect_edge() {
  local probe
  probe="$(curl -s -o /dev/null -w '%{http_code}' --max-time 10 \
    --resolve "www.tyny.ca:443:127.0.0.1" https://www.tyny.ca/actuator/health/liveness || true)"
  if [ "$probe" = "200" ]; then
    echo "real"
  else
    echo "throwaway"
  fi
}

# Build curl connection args + base URL for the chosen mode.
edge_conn() {
  local mode="$1"
  BASE_HTTPS="https://www.tyny.ca:443"
  HTTP_RESOLVE=(--resolve "tyny.ca:80:127.0.0.1")
  HTTPS_RESOLVE=(--resolve "www.tyny.ca:443:127.0.0.1")
  HTTPS_INSECURE=()
  APEX_HTTP="http://tyny.ca/"
  if [ "$mode" = "throwaway" ]; then
    BASE_HTTPS="https://www.tyny.ca:$SMOKE_HTTPS_PORT"
    HTTP_RESOLVE=(--resolve "tyny.ca:$SMOKE_HTTP_PORT:127.0.0.1")
    HTTPS_RESOLVE=(--resolve "www.tyny.ca:$SMOKE_HTTPS_PORT:127.0.0.1")
    HTTPS_INSECURE=(-k)
    APEX_HTTP="http://tyny.ca:$SMOKE_HTTP_PORT/"
  fi
}

# --- throwaway edge ------------------------------------------------------------
throwaway_up() {
  local net variant tmp_cfg name
  name="caddy-web-smoke-$$"
  SMOKE_CONTAINER="$name"
  net="$(docker inspect urlshortener-caddy --format '{{range $k,$v := .NetworkSettings.Networks}}{{$k}}{{end}}')" \
    || fail "cannot read the compose network from urlshortener-caddy (backend stack down?)"
  if docker ps --quiet --filter "publish=$SMOKE_HTTP_PORT" --filter "publish=$SMOKE_HTTPS_PORT" | grep -q .; then
    fail "ports $SMOKE_HTTP_PORT/$SMOKE_HTTPS_PORT already in use — cannot run throwaway edge"
  fi
  [ -f "$EDGE_CA_DIR" ] || fail "backend edge config not found at $EDGE_CA_DIR (smoke contract; deploy-web preflight checks it)"
  tmp_cfg="$(mktemp /tmp/smokeweb.XXXXXX.Caddyfile)"
  sed -e 's|^https://tyny\.ca {$|https://tyny.ca {\n\ttls internal|' \
      -e 's/^www\.tyny\.ca {$/www.tyny.ca {\n\ttls internal/' "$EDGE_CA_DIR" >"$tmp_cfg"
  variant="$(docker run --rm -v "$tmp_cfg:/etc/caddy/Caddyfile:ro" "$CADDY_IMAGE" caddy validate --config /etc/caddy/Caddyfile 2>&1)" \
    || { rm -f "$tmp_cfg"; fail "throwaway config invalid:\n$variant"; }
  docker run -d --rm --name "$name" \
    -v "$tmp_cfg:/etc/caddy/Caddyfile:ro" \
    -v "$FRONTEND_DIR:/srv/frontend:ro" \
    -p "$SMOKE_HTTP_PORT:80" -p "$SMOKE_HTTPS_PORT:443" \
    --network "$net" "$CADDY_IMAGE" >/dev/null || { rm -f "$tmp_cfg"; fail "cannot start throwaway caddy"; }
  rm -f "$tmp_cfg"
  trap 'docker rm -f "$SMOKE_CONTAINER" >/dev/null 2>&1 || true' EXIT
  log "throwaway edge on :$SMOKE_HTTP_PORT/:$SMOKE_HTTPS_PORT (container $name, network $net)"
  # wait for it to serve
  local i
  for i in $(seq 1 15); do
    if curl -s -o /dev/null -k --max-time 3 "${HTTPS_RESOLVE[@]}" "$BASE_HTTPS/" 2>/dev/null; then
      SMOKE_READY=1
      sleep 1
      return 0
    fi
    sleep 1
  done
  fail "throwaway edge did not become ready"
}

# --- HTTP legs (read-only) ----------------------------------------------------
http_legs() {
  local mode="$1" code ct body loc h_csp h_xfo h_hsts
  log "edge legs (mode=$mode)"
  edge_conn "$mode"
  if [ "$mode" = "throwaway" ]; then
    throwaway_up
  fi

  # 1. SPA root
  body="$(curl -s --max-time 10 "${HTTPS_RESOLVE[@]}" "${HTTPS_INSECURE[@]}" "$BASE_HTTPS/")"
  code="$(curl -s -o /dev/null -w '%{http_code}' --max-time 10 "${HTTPS_RESOLVE[@]}" "${HTTPS_INSECURE[@]}" "$BASE_HTTPS/")"
  [ "$code" = "200" ] && printf '%s' "$body" | grep -q 'src="/assets/' \
    && ok "GET / -> 200, built SPA (has /assets/ bundle)" \
    || bad "GET /" "code=$code (built SPA marker expected)"

  # 2. deep links fall through to index.html
  for p in /login /register /links /links/anything; do
    code="$(curl -s -o /dev/null -w '%{http_code}' --max-time 10 "${HTTPS_RESOLVE[@]}" "${HTTPS_INSECURE[@]}" "$BASE_HTTPS$p")"
    body="$(curl -s --max-time 10 "${HTTPS_RESOLVE[@]}" "${HTTPS_INSECURE[@]}" "$BASE_HTTPS$p")"
    [ "$code" = "200" ] && printf '%s' "$body" | grep -qi '<!doctype html' \
      && ok "GET $p -> 200 index.html" \
      || bad "GET $p" "code=$code"
  done

  # 3. a real asset is served
  asset="$(printf '%s' "$body" | grep -o 'src="/assets/[^"]*"' | head -1 | cut -d'"' -f2)"
  [ -n "$asset" ] || bad "asset leg" "no /assets/* in root"
  if [ -n "$asset" ]; then
    code="$(curl -s -o /dev/null -w '%{http_code}' --max-time 10 "${HTTPS_RESOLVE[@]}" "${HTTPS_INSECURE[@]}" "$BASE_HTTPS$asset")"
    [ "$code" = "200" ] && ok "GET $asset -> 200" || bad "GET $asset" "code=$code"
  fi

  # 4. a short-code path hits Java (JSON), never the SPA
  code="$(curl -s -o /dev/null -w '%{http_code}' --max-time 10 "${HTTPS_RESOLVE[@]}" "${HTTPS_INSECURE[@]}" "$BASE_HTTPS/$SHORTCODE_SAMPLE")"
  ct="$(curl -s -o /dev/null -w '%{content_type}' --max-time 10 "${HTTPS_RESOLVE[@]}" "${HTTPS_INSECURE[@]}" "$BASE_HTTPS/$SHORTCODE_SAMPLE")"
  [ "$code" = "404" ] && printf '%s' "$ct" | grep -q 'application/json' \
    && ok "GET /$SHORTCODE_SAMPLE -> 404 JSON (Java, never HTML)" \
    || bad "short-code leg" "code=$code ct=$ct"

  # 5. API same-origin
  code="$(curl -s -o /dev/null -w '%{http_code}' --max-time 10 "${HTTPS_RESOLVE[@]}" "${HTTPS_INSECURE[@]}" "$BASE_HTTPS/api/v1/auth/me")"
  ct="$(curl -s -o /dev/null -w '%{content_type}' --max-time 10 "${HTTPS_RESOLVE[@]}" "${HTTPS_INSECURE[@]}" "$BASE_HTTPS/api/v1/auth/me")"
  [ "$code" = "401" ] && printf '%s' "$ct" | grep -q 'application/json' \
    && ok "GET /api/v1/auth/me -> 401 JSON" \
    || bad "api leg" "code=$code ct=$ct"

  # 6. actuator allowlist (deviation) + deny
  code="$(curl -s -o /dev/null -w '%{http_code}' --max-time 10 "${HTTPS_RESOLVE[@]}" "${HTTPS_INSECURE[@]}" "$BASE_HTTPS/actuator/health/liveness")"
  [ "$code" = "200" ] && ok "GET /actuator/health/liveness -> 200" || bad "liveness leg" "code=$code"
  code="$(curl -s -o /dev/null -w '%{http_code}' --max-time 10 "${HTTPS_RESOLVE[@]}" "${HTTPS_INSECURE[@]}" "$BASE_HTTPS/actuator/env")"
  [ "$code" = "404" ] && ok "GET /actuator/env -> 404 (edge deny)" || bad "actuator deny leg" "code=$code"

  # 7. apex -> canonical https
  code="$(curl -s -o /dev/null -w '%{http_code}' --max-time 10 "${HTTP_RESOLVE[@]}" "$APEX_HTTP")"
  loc="$(curl -s -o /dev/null -w '%{redirect_url}' --max-time 10 "${HTTP_RESOLVE[@]}" "$APEX_HTTP")"
  [ "$code" = "308" ] && printf '%s' "$loc" | grep -q '^https://www.tyny.ca' \
    && ok "GET http://tyny.ca -> 308 https://www.tyny.ca" \
    || bad "apex leg" "code=$code location=$loc"

  # 8. SPA security headers (o-only on SPA responses)
  h_csp="$(curl -s -o /dev/null -w '%header{content-security-policy}' --max-time 10 "${HTTPS_RESOLVE[@]}" "${HTTPS_INSECURE[@]}" "$BASE_HTTPS/")"
  h_xfo="$(curl -s -o /dev/null -w '%header{x-frame-options}' --max-time 10 "${HTTPS_RESOLVE[@]}" "${HTTPS_INSECURE[@]}" "$BASE_HTTPS/")"
  h_hsts="$(curl -s -o /dev/null -w '%header{strict-transport-security}' --max-time 10 "${HTTPS_RESOLVE[@]}" "${HTTPS_INSECURE[@]}" "$BASE_HTTPS/")"
  printf '%s' "$h_csp" | grep -q "frame-ancestors 'none'" && [ "$h_xfo" = "DENY" ] \
    && ok "SPA headers CSP(frame-ancestors 'none') + XFO DENY" \
    || bad "SPA security headers" "csp='$h_csp' xfo='$h_xfo'"
  printf '%s' "$h_hsts" | grep -q 'preload' \
    && ok "HSTS preload on TLS" \
    || bad "HSTS" "hsts='$h_hsts'"

  if [ "$mode" = "throwaway" ]; then
    # ensure only the throwaway used the smoke ports (cleanup on EXIT trap)
    docker rm -f "$SMOKE_CONTAINER" >/dev/null 2>&1 && trap - EXIT
    SMOKE_CONTAINER=""
    ok "throwaway edge cleaned up"
  fi
}

self_test() {
  # offline: fabricate a fake FRONTEND_DIR and exercise the pure checks
  local t fails=0
  t="$(mktemp -d /tmp/smokeweb-selftest.XXXXXX)"
  local f
  fail2() { echo "  FAIL: $1" >&2; fails=$((fails + 1)); }
  ok2() { echo "  case $1 OK"; }

  FRONTEND_DIR="$t"
  export FRONTEND_DIR
  mkdir -p "$t/releases/v9.9.9"
  printf '<!-- built --><html><body><div id="app"></div><script src="/assets/app-a1b2c3.js"></script></body></html>\n' >"$t/releases/v9.9.9/index.html"
  echo 'v9.9.9' >"$t/releases/v9.9.9/VERSION"
  ln -s releases/v9.9.9 "$t/current"

  local out
  out="$(artifact_checks v9.9.9 2>&1 || true)"
  printf '%s' "$out" | grep -q 'artifact integrity' && ok2 "artifact_checks happy" || fail2 "artifact_checks happy"
  out="$(artifact_checks v1.0.0 2>&1 || true)"
  printf '%s' "$out" | grep -q 'VERSION == v1.0.0.*FAIL' && ok2 "artifact_checks version mismatch" || fail2 "artifact_checks version mismatch"

  # detect_edge is network bound; only assert the sed law-variant builders work
  local c
  c="$(mktemp /tmp/smokeweb-selftest.XXXXXX.Caddyfile)"
  printf 'http://tyny.ca {\n}\nhttps://tyny.ca {\n}\nwww.tyny.ca {\n}\n' >"$c"
  sed -e 's|^https://tyny\.ca {$|https://tyny.ca {\n\ttls internal|' \
      -e 's/^www\.tyny\.ca {$/www.tyny.ca {\n\ttls internal/' "$c" \
    | grep -c 'tls internal' | grep -q '^2$' && ok2 "law variant injection" || fail2 "law variant injection"
  rm -f "$c"

  [ "$fails" -eq 0 ] || { echo "self-test: FAIL ($fails)" >&2; rm -rf "$t"; exit 1; }
  rm -rf "$t"
  echo "self-test: PASS"
}

EXPECT_VERSION=""
case "${1:-}" in
  --expect-version)
    [ -n "${2:-}" ] || fail "usage: --expect-version <tag>"
    EXPECT_VERSION="$2"
    ;;
  --self-test) self_test; exit 0 ;;
  -h | --help | "") usage ;;
  *) fail "unknown option: $1" ;;
esac

log "smoke-web: FRONTEND_DIR=$FRONTEND_DIR, expect_version=${EXPECT_VERSION:--}"
artifact_checks "$EXPECT_VERSION"
[ "$MODES_FAILS" -eq 0 ] || { echo "artifact checks FAILED" >&2; exit 1; }

MODE="$(detect_edge)"
log "edge mode detected: $MODE"
http_legs "$MODE"
[ "$MODES_FAILS" -eq 0 ] || { echo "smoke-web: FAILED ($MODES_FAILS failures)" >&2; exit 1; }
echo "smoke-web: PASS"