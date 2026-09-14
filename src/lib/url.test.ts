import { test } from "node:test";
import assert from "node:assert/strict";
import { isValidHttpUrl } from "./url.ts";

test("isValidHttpUrl accepts http and https URLs", () => {
  assert.equal(isValidHttpUrl("https://example.com"), true);
  assert.equal(isValidHttpUrl("http://example.com/path?q=1"), true);
});

test("isValidHttpUrl rejects non-http protocols", () => {
  assert.equal(isValidHttpUrl("ftp://example.com"), false);
  assert.equal(isValidHttpUrl("javascript:alert(1)"), false);
});

test("isValidHttpUrl rejects empty, protocol-less and malformed values", () => {
  assert.equal(isValidHttpUrl(""), false);
  assert.equal(isValidHttpUrl("example.com"), false);
  assert.equal(isValidHttpUrl("not a url"), false);
});
