import { test } from "node:test";
import assert from "node:assert/strict";
import { formatClickCount, toBarPoints } from "./analytics.ts";

test("formatClickCount formats integers with pt-BR grouping", () => {
  assert.equal(formatClickCount(0), "0");
  assert.equal(formatClickCount(5), "5");
  assert.equal(formatClickCount(1234), "1.234");
  assert.equal(formatClickCount(1000000), "1.000.000");
});

test("formatClickCount clamps negatives to zero", () => {
  assert.equal(formatClickCount(-1), "0");
  assert.equal(formatClickCount(-100), "0");
});

test("formatClickCount handles non-finite values", () => {
  assert.equal(formatClickCount(NaN), "0");
  assert.equal(formatClickCount(Infinity), "0");
  assert.equal(formatClickCount(-Infinity), "0");
});

test("toBarPoints returns empty array for empty input", () => {
  assert.deepEqual(toBarPoints([]), []);
});

test("toBarPoints normalizes clicks to ratio 0..1", () => {
  const points = [
    { time: "2026-09-14", clicks: 10 },
    { time: "2026-09-13", clicks: 5 },
    { time: "2026-09-12", clicks: 20 },
  ];
  const result = toBarPoints(points);
  assert.equal(result.length, 3);
  assert.equal(result[2].clicks, 20);
  assert.equal(result[2].ratio, 1);
  assert.equal(result[1].clicks, 5);
  assert.equal(result[1].ratio, 0.25);
});

test("toBarPoints handles all zeros", () => {
  const points = [
    { time: "2026-09-14", clicks: 0 },
    { time: "2026-09-13", clicks: 0 },
  ];
  const result = toBarPoints(points);
  assert.equal(result.every((p) => p.ratio === 0), true);
  assert.ok(result.every((p) => p.label.length > 0));
});

test("toBarPoints formats date labels pt-BR", () => {
  // Use noon UTC to avoid timezone boundary issues
  const points = [{ time: "2026-09-14T12:00:00Z", clicks: 10 }];
  const result = toBarPoints(points);
  assert.ok(result[0].label.includes("14"));
  assert.ok(result[0].label.includes("09"));
});