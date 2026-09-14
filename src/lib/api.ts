import { clearSession, clearUser, getRefreshToken, getToken, setSession, setUser } from "./auth";
import { mapApiError } from "./errors";

const base = import.meta.env.VITE_API_BASE_URL ?? "";

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
  }
}

let refreshingPromise: Promise<boolean> | null = null;

async function refreshTokens(): Promise<boolean> {
  const refreshToken = getRefreshToken();
  if (!refreshToken) return false;
  const res = await fetch(`${base}/api/v1/auth/refresh`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({ refreshToken }),
  });
  if (!res.ok) return false;
  const data = (await res.json()) as AuthResponse;
  setSession(data.token, data.refreshToken);
  setUser({ userId: data.userId, email: data.email, name: data.name });
  return true;
}

async function request<T>(path: string, init: RequestInit = {}, retry = true): Promise<T> {
  const headers = new Headers(init.headers);
  headers.set("Accept", "application/json");
  if (init.body && !headers.has("Content-Type")) headers.set("Content-Type", "application/json");
  const token = getToken();
  if (token) headers.set("Authorization", `Bearer ${token}`);
  const res = await fetch(`${base}${path}`, { ...init, headers });

  if (res.status === 401 && retry && getRefreshToken()) {
    const isAuthEndpoint =
      path === "/api/v1/auth/login" ||
      path === "/api/v1/auth/register" ||
      path === "/api/v1/auth/refresh";
    if (!isAuthEndpoint) {
      if (!refreshingPromise) {
        refreshingPromise = refreshTokens().finally(() => {
          refreshingPromise = null;
        });
      }
      const ok = await refreshingPromise;
      if (ok) return request<T>(path, init, false);
      clearSession();
      clearUser();
    }
  }
  if (!res.ok) throw new ApiError(res.status, await res.text());
  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

export type AuthResponse = {
  token: string;
  refreshToken: string;
  userId: string;
  email: string;
  name: string;
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

export type UpdateLinkRequest = {
  originalUrl?: string | null;
  title?: string | null;
  tags?: string[] | null;
  utm?: UtmParams | null;
  expiresAt?: string | null;
  domain?: string | null;
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
};

export { mapApiError };
