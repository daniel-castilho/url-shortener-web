import { test } from "node:test";
import assert from "node:assert/strict";
import { mapApiError, parseRetryAfter } from "./errors.ts";

test("mapApiError maps known statuses to English copy", () => {
  assert.equal(mapApiError(400), "Invalid data.");
  assert.equal(mapApiError(401), "Session expired.");
  assert.equal(mapApiError(403), "You are not the owner of this link.");
  assert.equal(mapApiError(404), "Link not found.");
  assert.equal(mapApiError(409), "This alias already exists.");
  assert.equal(mapApiError(429), "Too many requests. Please wait a moment.");
});

test("mapApiError falls back to generic copy for other statuses", () => {
  assert.equal(mapApiError(500), "Could not complete the operation.");
  assert.equal(mapApiError(599), "Could not complete the operation.");
});

test("mapApiError 429 uses Retry-After seconds when present", () => {
  assert.equal(mapApiError(429, 7), "Too many requests. Try in 7s.");
  assert.equal(mapApiError(429, 0), "Too many requests. Try in 0s.");
});

test("parseRetryAfter returns seconds for numeric headers", () => {
  assert.equal(parseRetryAfter("12"), 12);
  assert.equal(parseRetryAfter("0"), 0);
});

test("parseRetryAfter returns undefined for missing, date or garbage headers", () => {
  assert.equal(parseRetryAfter(null), undefined);
  assert.equal(parseRetryAfter(""), undefined);
  assert.equal(parseRetryAfter("Wed, 21 Oct 2026 07:28:00 GMT"), undefined);
  assert.equal(parseRetryAfter("soon"), undefined);
  assert.equal(parseRetryAfter("12.5"), undefined);
  assert.equal(parseRetryAfter("-3"), undefined);
});
