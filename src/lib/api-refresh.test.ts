import { test } from "node:test";
import assert from "node:assert/strict";
import { subscribeSession } from "./session-events.ts";

process.env.VITE_AUTH_MODE = "cookie";
process.env.VITE_API_BASE_URL = "http://mock";

const sessionStorage = {
  _store: {} as Record<string, string>,
  getItem(key: string) { return this._store[key] ?? null; },
  setItem(key: string, value: string) { this._store[key] = value; },
  removeItem(key: string) { delete this._store[key]; },
};

Object.defineProperty(globalThis, "sessionStorage", { value: sessionStorage, writable: true });

const { api, ApiError } = await import("./api.ts");

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

test("cookie mode: 401 on a plain endpoint triggers refresh then retries once", async () => {
  const calls: Array<{ url: string; init?: RequestInit }> = [];
  let n = 0;
  Object.defineProperty(globalThis, "fetch", {
    value: async (input: string, init?: RequestInit) => {
      calls.push({ url: input, init });
      n += 1;
      if (n === 1) return new Response("unauthorized", { status: 401 });
      if (n === 2) {
        assert.equal(init?.method, "POST");
        assert.equal(init?.body, undefined);
        assert.equal(init?.credentials, "include");
        return jsonResponse({
          token: "t",
          refreshToken: "r",
          userId: "1",
          email: "a@b.c",
          name: "N",
        });
      }
      return jsonResponse({ userId: "1", email: "a@b.c", name: "N" });
    },
    writable: true,
    configurable: true,
  });

  const me = await api.me();
  assert.deepEqual(me, { userId: "1", email: "a@b.c", name: "N" });
  assert.equal(calls.length, 3, "original 401 + refresh + one retry");
  assert.match(calls[0]!.url, /\/api\/v1\/auth\/me$/);
  assert.match(calls[1]!.url, /\/api\/v1\/auth\/refresh$/);
  assert.equal(calls[1]!.init?.body, undefined, "cookie mode must not send a JSON refreshToken");
  assert.equal(calls[2]!.url, calls[0]!.url, "retry hits the original endpoint");
});

test("cookie mode: refresh failure emits cleared and does not retry forever", async () => {
  const events: string[] = [];
  const unsubscribe = subscribeSession((event) => events.push(event.type));
  const calls: string[] = [];
  Object.defineProperty(globalThis, "fetch", {
    value: async (input: string) => {
      calls.push(input);
      return new Response("unauthorized", { status: 401 });
    },
    writable: true,
    configurable: true,
  });

  await assert.rejects(
    api.me(),
    (err: unknown) => err instanceof ApiError && err.status === 401,
  );
  assert.deepEqual(events, ["cleared"]);
  assert.equal(calls.length, 2, "original 401 + one refresh attempt, no infinite loop");
  assert.match(calls[1]!, /\/api\/v1\/auth\/refresh$/);
  unsubscribe();
});