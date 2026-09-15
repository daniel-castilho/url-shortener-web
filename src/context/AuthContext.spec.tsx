import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter, Route, Routes, useLocation } from "react-router-dom";
import { http, HttpResponse } from "msw";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import { Private } from "@/App";
import { server } from "@/test/setup";

beforeEach(() => {
  vi.stubEnv("VITE_AUTH_MODE", "cookie");
});

afterEach(() => {
  vi.unstubAllEnvs();
  sessionStorage.clear();
});

function Probe() {
  const { user, isAuthenticated, status } = useAuth();
  const location = useLocation();
  return (
    <>
      <p>user: {user?.email ?? "none"}</p>
      <p>auth: {isAuthenticated ? "true" : "false"}</p>
      <p>status: {status}</p>
      <p>path: {location.pathname}</p>
    </>
  );
}

function renderCookieProvider() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });
  render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={["/"]}>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<Probe />} />
            <Route path="/login" element={<Probe />} />
          </Routes>
        </AuthProvider>
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

describe("AuthProvider (cookie mode)", () => {
  it("/me 200 hidrata o usuário sem expor Authorization nem cookie", async () => {
    let meHeaders: Record<string, string> = {};
    server.use(
      http.get("/api/v1/auth/me", ({ request }) => {
        meHeaders = Object.fromEntries(request.headers.entries());
        return HttpResponse.json({
          userId: "1",
          email: "test@example.com",
          name: "Test User",
        });
      }),
    );

    renderCookieProvider();

    expect(await screen.findByText("user: test@example.com")).toBeInTheDocument();
    expect(screen.getByText("path: /")).toBeInTheDocument();
    expect(meHeaders["authorization"]).toBeUndefined();
    expect(meHeaders["cookie"]).toBeUndefined();
  });

  it("/me 401 seguido de refresh 401 limpa a sessão e vai para /login", async () => {
    let refreshBody: string | null = null;
    server.use(
      http.post("/api/v1/auth/refresh", async ({ request }) => {
        refreshBody = await request.text();
        return new HttpResponse(null, { status: 401 });
      }),
    );

    renderCookieProvider();

    expect(await screen.findByText("path: /login")).toBeInTheDocument();
    expect(screen.getByText("user: none")).toBeInTheDocument();
    expect(screen.getByText("auth: false")).toBeInTheDocument();
    expect(refreshBody).toBe("");
  });

  it("/me pendente: primeiro paint é loading, não /login", async () => {
    server.use(
      http.get("/api/v1/auth/me", () => new Promise<Response>(() => {})),
    );

    renderCookieProvider();

    expect(screen.getByText("status: loading")).toBeInTheDocument();
    expect(screen.getByText("path: /")).toBeInTheDocument();
    expect(screen.queryByText("path: /login")).not.toBeInTheDocument();
  });

  it("/me 404 (endpoint ausente): status ready, sem logout", async () => {
    server.use(
      http.get("/api/v1/auth/me", () => new HttpResponse(null, { status: 404 })),
    );

    renderCookieProvider();

    expect(await screen.findByText("status: ready")).toBeInTheDocument();
    expect(screen.getByText("path: /")).toBeInTheDocument();
    expect(screen.getByText("user: none")).toBeInTheDocument();
  });
});

describe("AuthProvider + Private (bearer mode)", () => {
  beforeEach(() => {
    vi.stubEnv("VITE_AUTH_MODE", "bearer");
  });

  it("sessão em sessionStorage autentica no primeiro paint — sem form de login", () => {
    sessionStorage.setItem("us.token", "tok-123");
    sessionStorage.setItem("us.userId", "1");
    sessionStorage.setItem("us.email", "seeded@example.com");
    sessionStorage.setItem("us.name", "Seeded User");

    renderWithBearerProviders();

    expect(screen.getByText("auth: true")).toBeInTheDocument();
    expect(screen.getByText("user: seeded@example.com")).toBeInTheDocument();
    expect(screen.getByText("status: ready")).toBeInTheDocument();
    expect(screen.getByText("path: /links")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Login" })).not.toBeInTheDocument();
  });

  it("sem sessão: Private redireciona para /login no primeiro paint", () => {
    renderWithBearerProviders();

    expect(screen.getByText("path: /login")).toBeInTheDocument();
    expect(screen.getByText("auth: false")).toBeInTheDocument();
  });
});

function renderWithBearerProviders() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false, gcTime: 0 },
      mutations: { retry: false },
    },
  });
  render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={["/links"]}>
        <AuthProvider>
          <Routes>
            <Route
              path="/links"
              element={
                <Private>
                  <Probe />
                </Private>
              }
            />
            <Route path="/login" element={<Probe />} />
          </Routes>
        </AuthProvider>
      </MemoryRouter>
    </QueryClientProvider>,
  );
}