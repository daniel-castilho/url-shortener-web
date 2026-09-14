import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter, Route, Routes, useLocation } from "react-router-dom";
import { http, HttpResponse } from "msw";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import { server } from "@/test/setup";

beforeEach(() => {
  vi.stubEnv("VITE_AUTH_MODE", "cookie");
});

afterEach(() => {
  vi.unstubAllEnvs();
});

function Probe() {
  const { user, isAuthenticated } = useAuth();
  const location = useLocation();
  return (
    <>
      <p>user: {user?.email ?? "none"}</p>
      <p>auth: {isAuthenticated ? "true" : "false"}</p>
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
});