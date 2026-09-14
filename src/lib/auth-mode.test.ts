import { test } from "node:test";
import assert from "node:assert/strict";

Object.defineProperty(import.meta, "env", {
  value: { VITE_AUTH_MODE: "bearer" },
  writable: true,
  configurable: true,
});

const sessionStorage = {
  _store: {} as Record<string, string>,
  getItem(key: string) { return this._store[key] ?? null; },
  setItem(key: string, value: string) { this._store[key] = value; },
  removeItem(key: string) { delete this._store[key]; },
};

Object.defineProperty(globalThis, "sessionStorage", { value: sessionStorage, writable: true });

import { getToken, getRefreshToken, getUser, setSession, clearSession, clearUser, setUser } from "./auth.ts";

test("getToken reads from sessionStorage", () => {
  sessionStorage.setItem("us.token", "test-token");
  const token = getToken();
  assert.equal(token, "test-token");
});

test("getRefreshToken reads from sessionStorage", () => {
  sessionStorage.setItem("us.refreshToken", "test-refresh");
  const token = getRefreshToken();
  assert.equal(token, "test-refresh");
});

test("getUser returns user when all keys present", () => {
  sessionStorage.setItem("us.userId", "123");
  sessionStorage.setItem("us.email", "test@test.com");
  sessionStorage.setItem("us.name", "Test User");
  const user = getUser();
  assert.ok(user !== null);
  assert.equal(user?.userId, "123");
  assert.equal(user?.email, "test@test.com");
  assert.equal(user?.name, "Test User");
});

test("getUser returns null when keys missing", () => {
  sessionStorage.removeItem("us.userId");
  const user = getUser();
  assert.equal(user, null);
});

test("setSession writes token and refreshToken", () => {
  setSession("new-token", "new-refresh");
  assert.equal(sessionStorage.getItem("us.token"), "new-token");
  assert.equal(sessionStorage.getItem("us.refreshToken"), "new-refresh");
});

test("clearSession removes token keys", () => {
  sessionStorage.setItem("us.token", "x");
  sessionStorage.setItem("us.refreshToken", "y");
  clearSession();
  assert.equal(sessionStorage.getItem("us.token"), null);
  assert.equal(sessionStorage.getItem("us.refreshToken"), null);
});

test("clearUser removes user keys", () => {
  sessionStorage.setItem("us.userId", "1");
  sessionStorage.setItem("us.email", "e");
  sessionStorage.setItem("us.name", "n");
  clearUser();
  assert.equal(sessionStorage.getItem("us.userId"), null);
  assert.equal(sessionStorage.getItem("us.email"), null);
  assert.equal(sessionStorage.getItem("us.name"), null);
});

test("setUser writes user keys", () => {
  setUser({ userId: "42", email: "a@b.c", name: "Name" });
  assert.equal(sessionStorage.getItem("us.userId"), "42");
  assert.equal(sessionStorage.getItem("us.email"), "a@b.c");
  assert.equal(sessionStorage.getItem("us.name"), "Name");
});