import { clearSession, clearUser, getRefreshToken, getToken, setSession, setUser } from "./auth.ts";
import { mapApiError, parseRetryAfter } from "./errors.ts";
import { emitSession } from "./session-events.ts";
import { createRefreshCoordinator } from "./refresh-coordinator.ts";
import { isCookieAuth } from "./auth-mode.ts";

const base =
  (typeof import.meta !== "undefined" && import.meta.env?.VITE_API_BASE_URL) ??
  (typeof process !== "undefined" && process.env?.VITE_API_BASE_URL) ??
  "";

export class ApiError extends Error {
  status: number;
  requestId?: string;
  retryAfterSec?: number;

  constructor(status: number, message: string, requestId?: string, retryAfterSec?: number) {
    super(message);
    this.status = status;
    this.requestId = requestId;
    this.retryAfterSec = retryAfterSec;
  }
}

function newRequestId(): string {
  return crypto.randomUUID();
}

const refreshCoordinator = createRefreshCoordinator(async (): Promise<boolean> => {
  const cookieMode = isCookieAuth();
  const refreshToken = cookieMode ? undefined : getRefreshToken();
  if (!cookieMode && !refreshToken) return false;
  const res = await fetch(`${base}/api/v1/auth/refresh`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json", Accept: "application/json", "X-Request-Id": newRequestId() },
    body: cookieMode ? undefined : JSON.stringify({ refreshToken }),
  });
  if (!res.ok) return false;
  const data = (await res.json()) as AuthResponse;
  if (!cookieMode) {
    setSession(data.token, data.refreshToken);
    setUser({ userId: data.userId, email: data.email, name: data.name });
  }
  emitSession({ type: "refreshed" });
  return true;
});

async function request<T>(path: string, init: RequestInit = {}, retry = true): Promise<T> {
  const requestId = newRequestId();
  const headers = new Headers(init.headers);
  headers.set("Accept", "application/json");
  headers.set("X-Request-Id", requestId);
  if (init.body && !headers.has("Content-Type")) headers.set("Content-Type", "application/json");
  const cookieMode = isCookieAuth();
  if (!cookieMode) {
    const token = getToken();
    if (token) headers.set("Authorization", `Bearer ${token}`);
  }
  const res = await fetch(`${base}${path}`, { ...init, headers, credentials: "include" });

  if (res.status === 401 && retry && (cookieMode || Boolean(getRefreshToken()))) {
    const isAuthEndpoint =
      path === "/api/v1/auth/login" ||
      path === "/api/v1/auth/register" ||
      path === "/api/v1/auth/refresh";
    if (!isAuthEndpoint) {
      const ok = await refreshCoordinator.refresh();
      if (ok) return request<T>(path, init, false);
      clearSession();
      clearUser();
      emitSession({ type: "cleared" });
    }
  }
  if (!res.ok) {
    const retryAfterSec = res.status === 429 ? parseRetryAfter(res.headers.get("Retry-After")) : undefined;
    throw new ApiError(res.status, await res.text(), requestId, retryAfterSec);
  }
  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

export type AuthResponse = {
  token: string;
  refreshToken: string;
  userId: string;
  email: string;
  name: string;
  role?: "USER" | "ADMIN";
};

export type UserResponse = {
  userId: string;
  email: string;
  name: string;
  role?: "USER" | "ADMIN";
};

export type ShortenRequest = {
  originalUrl: string;
  customAlias?: string | null;
  ttlSeconds?: number | null;
  domain?: string | null;
};

export type ShortenResponse = { id: string; shortUrl: string };

export type UtmParams = {
  source?: string | null;
  medium?: string | null;
  campaign?: string | null;
  term?: string | null;
  content?: string | null;
};

export type ShortUrlResponse = {
  id: string;
  originalUrl: string;
  shortUrl: string;
  createdAt: string;
  userId: string | null;
  isCustomAlias: boolean;
  clickCount: number;
  expiresAt: string | null;
  title: string | null;
  tags: string[] | null;
  utm: UtmParams | null;
  deletedAt: string | null;
  domain: string | null;
};

export type LinkListResponse = {
  items: ShortUrlResponse[];
  nextCursor: string | null;
  hasMore: boolean;
};

export type AdminUserResponse = {
  userId: string;
  email: string;
  name: string;
  role: "USER" | "ADMIN";
  blocked: boolean;
  createdAt: string;
};

export type AdminUserListResponse = {
  items: AdminUserResponse[];
  nextCursor: string | null;
  hasMore: boolean;
};

export type AdminUrlResponse = {
  id: string;
  originalUrl: string;
  shortUrl: string;
  createdAt: string;
  userId: string | null;
  isCustomAlias: boolean;
  clickCount: number;
  expiresAt: string | null;
  title: string | null;
  tags: string[] | null;
  utm: UtmParams | null;
  deletedAt: string | null;
  domain: string | null;
  ownerUserId: string;
  ownerEmail: string | null;
};

export type UpdateLinkRequest = {
  originalUrl?: string | null;
  title?: string | null;
  tags?: string[] | null;
  utm?: UtmParams | null;
  expiresAt?: string | null;
  domain?: string | null;
};

export type ClickSeriesPoint = {
  time: string;
  clicks: number;
};

export type ClickAnalyticsResponse = {
  id: string;
  unit: string;
  from: string;
  to: string;
  totalClicks: number;
  series: ClickSeriesPoint[];
  breakdown: Record<string, Record<string, number>>;
  uniquePerBucket: Record<string, number>;
};

export const api = {
  register: (name: string, email: string, password: string) =>
    request<AuthResponse>("/api/v1/auth/register", {
      method: "POST",
      body: JSON.stringify({ name, email, password }),
    }),
  login: (email: string, password: string) =>
    request<AuthResponse>("/api/v1/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }),
  me: () => request<UserResponse>("/api/v1/auth/me"),
  logout: () => request<void>("/api/v1/auth/logout", { method: "POST" }),
  shorten: (body: ShortenRequest) =>
    request<ShortenResponse>("/api/v1/urls", { method: "POST", body: JSON.stringify(body) }),
  listUrls: (limit = 20, cursor?: string) => {
    const q = new URLSearchParams({ limit: String(limit) });
    if (cursor) q.set("cursor", cursor);
    return request<LinkListResponse>(`/api/v1/urls?${q}`);
  },
  getUrl: (id: string) => request<ShortUrlResponse>(`/api/v1/urls/${id}`),
  updateUrl: (id: string, body: UpdateLinkRequest) =>
    request<ShortUrlResponse>(`/api/v1/urls/${id}`, {
      method: "PATCH",
      body: JSON.stringify(body),
    }),
  archiveUrl: (id: string) => request<void>(`/api/v1/urls/${id}`, { method: "DELETE" }),
  getClicks: (id: string) =>
    request<ClickAnalyticsResponse>(`/api/v1/urls/${id}/clicks?unit=day`),
  adminUsers: (limit = 20, cursor?: string, q?: string) => {
    const params = new URLSearchParams({ limit: String(limit) });
    if (cursor) params.set("cursor", cursor);
    if (q) params.set("q", q);
    return request<AdminUserListResponse>(`/api/v1/admin/users?${params}`);
  },
  adminUserUrls: (userId: string) =>
    request<LinkListResponse>(`/api/v1/admin/users/${userId}/urls`),
  adminUrlByCode: (code: string) =>
    request<AdminUrlResponse>(`/api/v1/admin/urls?code=${encodeURIComponent(code)}`),
  adminBlock: (userId: string) =>
    request<void>(`/api/v1/admin/users/${userId}/block`, { method: "POST" }),
  adminUnblock: (userId: string) =>
    request<void>(`/api/v1/admin/users/${userId}/unblock`, { method: "POST" }),
  adminForceArchive: (id: string) =>
    request<void>(`/api/v1/admin/urls/${id}`, { method: "DELETE" }),
};

export { mapApiError };