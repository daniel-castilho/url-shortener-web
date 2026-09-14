import { render } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { AuthProvider } from "@/context/AuthContext";
import type { ReactElement, ReactNode } from "react";

type RenderOptions = {
  initialEntries?: string[];
  routePath?: string;
};

export function renderWithProviders(ui: ReactElement, options: RenderOptions = {}) {
  const { initialEntries = ["/"], routePath } = options;
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false, gcTime: 0 },
      mutations: { retry: false },
    },
  });

  function Wrapper({ children }: { children: ReactNode }) {
    const content = routePath ? (
      <Routes>
        <Route path={routePath} element={<>{children}</>} />
      </Routes>
    ) : (
      children
    );
    return (
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={initialEntries}>
          <AuthProvider>{content}</AuthProvider>
        </MemoryRouter>
      </QueryClientProvider>
    );
  }

  return render(ui, { wrapper: Wrapper });
}