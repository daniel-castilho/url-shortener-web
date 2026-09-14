import { isCookieAuth } from "./auth-mode.ts";

const TOKEN = "us.token";
const REFRESH = "us.refreshToken";
const USER_ID = "us.userId";
const USER_EMAIL = "us.email";
const USER_NAME = "us.name";

export type User = {
  userId: string;
  email: string;
  name: string;
};

export function getToken(): string | null {
  if (isCookieAuth()) return null;
  return sessionStorage.getItem(TOKEN);
}

export function getRefreshToken(): string | null {
  if (isCookieAuth()) return null;
  return sessionStorage.getItem(REFRESH);
}

export function getUser(): User | null {
  const userId = sessionStorage.getItem(USER_ID);
  const email = sessionStorage.getItem(USER_EMAIL);
  const name = sessionStorage.getItem(USER_NAME);
  if (!userId || !email || !name) return null;
  return { userId, email, name };
}

export function setSession(token: string, refreshToken: string): void {
  if (isCookieAuth()) return;
  sessionStorage.setItem(TOKEN, token);
  sessionStorage.setItem(REFRESH, refreshToken);
}

export function setUser(user: User): void {
  sessionStorage.setItem(USER_ID, user.userId);
  sessionStorage.setItem(USER_EMAIL, user.email);
  sessionStorage.setItem(USER_NAME, user.name);
}

export function clearSession(): void {
  sessionStorage.removeItem(TOKEN);
  sessionStorage.removeItem(REFRESH);
}

export function clearUser(): void {
  sessionStorage.removeItem(USER_ID);
  sessionStorage.removeItem(USER_EMAIL);
  sessionStorage.removeItem(USER_NAME);
}