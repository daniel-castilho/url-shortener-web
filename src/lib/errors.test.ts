import { test } from "node:test";
import assert from "node:assert/strict";
import { mapApiError, parseRetryAfter } from "./errors.ts";

test("mapApiError maps known statuses to PT-BR copy", () => {
  assert.equal(mapApiError(400), "Dados inválidos.");
  assert.equal(mapApiError(401), "Sessão expirada.");
  assert.equal(mapApiError(403), "Você não é o dono deste link.");
  assert.equal(mapApiError(409), "Este alias já existe.");
  assert.equal(mapApiError(429), "Muitas tentativas. Espere um pouco.");
});

test("mapApiError falls back to generic copy for other statuses", () => {
  assert.equal(mapApiError(500), "Não foi possível completar a operação.");
  assert.equal(mapApiError(599), "Não foi possível completar a operação.");
});

test("mapApiError 429 uses Retry-After seconds when present", () => {
  assert.equal(mapApiError(429, 7), "Muitas tentativas. Tente em 7s.");
  assert.equal(mapApiError(429, 0), "Muitas tentativas. Tente em 0s.");
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
