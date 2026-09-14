import { test } from "node:test";
import assert from "node:assert/strict";
import { subscribeSession, emitSession } from "./session-events.ts";

test("emit delivers cleared and refreshed events to subscribers", () => {
  const received: Array<{ type: string }> = [];
  const unsubscribe = subscribeSession((e) => received.push(e));

  emitSession({ type: "cleared" });
  emitSession({ type: "refreshed" });

  assert.deepEqual(received, [{ type: "cleared" }, { type: "refreshed" }]);
  unsubscribe();
});

test("unsubscribed handlers no longer receive events", () => {
  const received: Array<{ type: string }> = [];
  const unsubscribe = subscribeSession((e) => received.push(e));
  unsubscribe();

  emitSession({ type: "cleared" });

  assert.deepEqual(received, []);
});

test("multiple subscribers all receive the same event", () => {
  const first: Array<{ type: string }> = [];
  const second: Array<{ type: string }> = [];
  const unsubFirst = subscribeSession((e) => first.push(e));
  const unsubSecond = subscribeSession((e) => second.push(e));

  emitSession({ type: "refreshed" });

  assert.deepEqual(first, [{ type: "refreshed" }]);
  assert.deepEqual(second, [{ type: "refreshed" }]);
  unsubFirst();
  unsubSecond();
});
