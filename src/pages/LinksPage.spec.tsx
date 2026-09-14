import { describe, expect, it } from "vitest";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw";
import LinksPage from "@/pages/LinksPage";
import { renderWithProviders } from "@/test/render";
import { server } from "@/test/setup";

describe("LinksPage", () => {
  it("estado vazio mostra a cópia e o link para a home", async () => {
    server.use(
      http.get("/api/v1/urls", () =>
        HttpResponse.json({ items: [], nextCursor: null, hasMore: false }),
      ),
    );

    renderWithProviders(<LinksPage />);

    expect(await screen.findByText("Nenhum link ainda.")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Encurtar uma URL" })).toBeInTheDocument();
  });

  it("lista links e carrega mais quando hasMore", async () => {
    const user = userEvent.setup();
    renderWithProviders(<LinksPage />);

    expect(await screen.findByRole("link", { name: "abc123" })).toBeInTheDocument();
    expect(screen.getByText("https://example.com")).toBeInTheDocument();
    expect(screen.getByText(/cliques: 5/)).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Mais" }));

    expect(await screen.findByText("https://second.example")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Mais" })).not.toBeInTheDocument();
  });
});