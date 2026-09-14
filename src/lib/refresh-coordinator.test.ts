import { test } from "node:test";
import assert from "node:assert/strict";
import { createRefreshCoordinator } from "./refresh-coordinator.ts";

test("two overlapping callers share one refresh (single-flight)", async () => {
  let calls = 0;
  let resolveRefresh!: (ok: boolean) => void;
  const doRefresh = () =>
    new Promise<boolean>((resolve) => {
      calls += 1;
      resolveRefresh = resolve;
    });
  const { refresh } = createRefreshCoordinator(doRefresh);

  const first = refresh();
  const second = refresh();
  resolveRefresh(true);
  const [firstResult, secondResult] = await Promise.all([first, second]);

  assert.equal(calls, 1);
  assert.equal(firstResult, true);
  assert.equal(secondResult, true);
});

test("sequential callers trigger a new refresh each time", async () => {
  let calls = 0;
  const { refresh } = createRefreshCoordinator(async () => {
    calls += 1;
    return true;
  });

  await refresh();
  await refresh();

  assert.equal(calls, 2);
});

test("failed refresh clears in-flight state so the next caller retries", async () => {
  let calls = 0;
  const { refresh } = createRefreshCoordinator(async () => {
    calls += 1;
    return calls === 1 ? false : true;
  });

  const first = await refresh();
  const second = await refresh();

  assert.equal(first, false);
  assert.equal(second, true);
  assert.equal(calls, 2);
});

test("rejected refresh propagates to waiters and clears state", async () => {
  let calls = 0;
  const { refresh } = createRefreshCoordinator(async () => {
    calls += 1;
    throw new Error("network down");
  });

  await assert.rejects(refresh(), /network down/);
  await assert.rejects(refresh(), /network down/);
  assert.equal(calls, 2);
});
