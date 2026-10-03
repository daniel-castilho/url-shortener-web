import { http, HttpResponse } from "msw";

// Test helper to capture the last shorten request body
let lastShortenRequest: Record<string, unknown> | null = null;

export function getLastShortenRequest(): Record<string, unknown> | null {
  return lastShortenRequest;
}

export function resetLastShortenRequest(): void {
  lastShortenRequest = null;
}

type LinkResponse = {
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
  utm: Record<string, string> | null;
  deletedAt: string | null;
  domain: string | null;
};

type AdminUserResponse = {
  userId: string;
  email: string;
  name: string;
  role: "USER" | "ADMIN";
  blocked: boolean;
  createdAt: string;
};

type AdminUrlLookupResponse = {
  item: LinkResponse;
  ownerUserId: string;
  ownerEmail: string | null;
};

export function makeLink(overrides: Partial<LinkResponse> = {}): LinkResponse {
  const id = overrides.id ?? "abc123";
  return {
    id,
    originalUrl: "https://example.com",
    shortUrl: `https://tyny.url/${id}`,
    createdAt: "2026-09-01T00:00:00Z",
    userId: "1",
    isCustomAlias: false,
    clickCount: 5,
    expiresAt: null,
    title: "Test Link",
    tags: ["tag1"],
    utm: null,
    deletedAt: null,
    domain: null,
    ...overrides,
  };
}

export function makeAdminUser(overrides: Partial<AdminUserResponse> = {}): AdminUserResponse {
  return {
    userId: "2",
    email: "user@example.com",
    name: "Regular User",
    role: "USER",
    blocked: false,
    createdAt: "2026-09-01T00:00:00Z",
    ...overrides,
  };
}

export function makeAdminUrl(
  overrides: { item?: Partial<LinkResponse>; ownerUserId?: string; ownerEmail?: string | null } = {},
): AdminUrlLookupResponse {
  return {
    item: makeLink(overrides.item ?? {}),
    ownerUserId: overrides.ownerUserId ?? "1",
    ownerEmail: overrides.ownerEmail ?? "owner@example.com",
  };
}

// In-memory state for auth simulation
let authState = {
  isAuthenticated: false,
  isBlocked: false,
  hasRefreshToken: true,
};

export function setAuthState(state: Partial<typeof authState>): void {
  authState = { ...authState, ...state };
}

export function resetAuthState(): void {
  authState = { isAuthenticated: false, isBlocked: false, hasRefreshToken: true };
}

export const handlers = [
  http.post("/api/v1/auth/login", async ({ request }) => {
    const body = (await request.json()) as { email?: string };
    if (body.email === "fail@example.com") {
      return HttpResponse.json({ message: "Invalid credentials" }, { status: 401 });
    }
    if (body.email === "blocked@example.com") {
      return HttpResponse.json({ message: "Account blocked." }, { status: 403 });
    }
    if (body.email === "ratelimit@example.com") {
      return new HttpResponse(null, {
        status: 429,
        headers: { "Retry-After": "5" },
      });
    }
    return HttpResponse.json(
      {
        token: "access-token",
        refreshToken: "refresh-token",
        userId: "1",
        email: body.email ?? "test@example.com",
        name: "Test User",
        role: "ADMIN",
      },
      { status: 200 },
    );
  }),

  http.post("/api/v1/auth/register", async ({ request }) => {
    const body = (await request.json()) as { email?: string };
    if (body.email === "ratelimit@example.com") {
      return new HttpResponse(null, {
        status: 429,
        headers: { "Retry-After": "5" },
      });
    }
    return HttpResponse.json(
      {
        token: "access-token",
        refreshToken: "refresh-token",
        userId: "1",
        email: body.email ?? "test@example.com",
        name: "Test User",
      },
      { status: 200 },
    );
  }),

  http.get("/api/v1/auth/me", () => {
    if (!authState.isAuthenticated) {
      return new HttpResponse(null, { status: 401 });
    }
    return HttpResponse.json(
      { userId: "1", email: "test@example.com", name: "Test User", role: "USER" },
      { status: 200 },
    );
  }),

  http.post("/api/v1/auth/logout", () => {
    resetAuthState();
    return new HttpResponse(null, { status: 204 });
  }),

  http.post("/api/v1/auth/refresh", () => {
    if (!authState.hasRefreshToken) {
      // Refresh failure = hard logout: clear cookies via 401
      return new HttpResponse(null, { status: 401 });
    }
    return HttpResponse.json(
      {
        token: "new-access-token",
        refreshToken: "new-refresh-token",
        userId: "1",
        email: "test@example.com",
        name: "Test User",
        role: "USER",
      },
      { status: 200 },
    );
  }),

  http.post("/api/v1/urls", async ({ request }) => {
    const body = (await request.json()) as Record<string, unknown>;
    lastShortenRequest = body;
    const originalUrl = (body.originalUrl as string) ?? "";
    if (originalUrl.includes("ratelimit")) {
      return new HttpResponse(null, {
        status: 429,
        headers: { "Retry-After": "7" },
      });
    }
    if (!originalUrl.startsWith("http")) {
      return HttpResponse.json({ message: "Invalid data." }, { status: 400 });
    }
    const customAlias = body.customAlias as string | undefined;
    if (customAlias && customAlias.length > 64) {
      return HttpResponse.json({ message: "Custom alias must be at most 64 characters." }, { status: 400 });
    }
    return HttpResponse.json(
      { id: "abc123", shortUrl: "https://tyny.url/abc123" },
      { status: 201 },
    );
  }),

  http.get("/api/v1/urls", ({ request }) => {
    const url = new URL(request.url);
    const cursor = url.searchParams.get("cursor");
    if (cursor) {
      return HttpResponse.json({
        items: [makeLink({ id: "def456", originalUrl: "https://second.example" })],
        nextCursor: null,
        hasMore: false,
      });
    }
    return HttpResponse.json({
      items: [makeLink({ id: "abc123", originalUrl: "https://example.com" })],
      nextCursor: "next-cursor",
      hasMore: true,
    });
  }),

  http.get("/api/v1/urls/:id", ({ params }) =>
    HttpResponse.json(makeLink({ id: String(params.id) })),
  ),

  http.patch("/api/v1/urls/:id", async ({ request, params }) => {
    const body = (await request.json()) as Partial<LinkResponse>;
    return HttpResponse.json(makeLink({ id: String(params.id), ...body }));
  }),

  http.delete("/api/v1/urls/:id", () => new HttpResponse(null, { status: 204 })),

  http.get("/api/v1/urls/:id/clicks", () =>
    HttpResponse.json({
      id: "abc123",
      unit: "day",
      from: "2026-09-01",
      to: "2026-09-07",
      totalClicks: 5,
      series: [
        { time: "2026-09-01", clicks: 2 },
        { time: "2026-09-02", clicks: 3 },
      ],
      breakdown: {},
      uniquePerBucket: {},
    }),
  ),

  // Version endpoint
  http.get("/actuator/info", () =>
    HttpResponse.json({
      build: {
        artifact: "url-shortener-service",
        version: "0.3.0",
        time: "2026-10-03T00:00:00Z",
      },
    }),
  ),

  // Admin endpoints
  http.get("/api/v1/admin/users", ({ request }) => {
    const url = new URL(request.url);
    const cursor = url.searchParams.get("cursor");
    const q = url.searchParams.get("q");
    const users = [makeAdminUser(), makeAdminUser({ userId: "3", email: "another@example.com", name: "Another User" })];
    if (q) {
      return HttpResponse.json({
        items: users.filter(u => u.email.startsWith(q)),
        nextCursor: null,
        hasMore: false,
      });
    }
    if (cursor) {
      return HttpResponse.json({
        items: [],
        nextCursor: null,
        hasMore: false,
      });
    }
    return HttpResponse.json({
      items: users,
      nextCursor: "next-cursor",
      hasMore: true,
    });
  }),

  http.get("/api/v1/admin/users/:userId/urls", ({ params }) =>
    HttpResponse.json({
      items: [
        makeLink({ id: "link1", userId: String(params.userId) }),
        makeLink({ id: "link2", userId: String(params.userId), deletedAt: "2026-09-15T00:00:00Z" }),
      ],
      nextCursor: null,
      hasMore: false,
    }),
  ),

  http.get("/api/v1/admin/urls", ({ request }) => {
    const url = new URL(request.url);
    const code = url.searchParams.get("code");
    if (code) {
      return HttpResponse.json(
        makeAdminUrl({ item: { id: code, shortUrl: `https://tyny.url/${code}` }, ownerUserId: "1", ownerEmail: "owner@example.com" }),
      );
    }
    return new HttpResponse(null, { status: 404 });
  }),

  http.post("/api/v1/admin/users/:userId/block", () => new HttpResponse(null, { status: 204 })),
  http.post("/api/v1/admin/users/:userId/unblock", () => new HttpResponse(null, { status: 204 })),
  http.delete("/api/v1/admin/urls/:id", () => new HttpResponse(null, { status: 204 })),
];