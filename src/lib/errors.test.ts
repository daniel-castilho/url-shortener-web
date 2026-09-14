import { test } from "node:test";
import assert from "node:assert/strict";
import { mapApiError } from "./errors.ts";

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
