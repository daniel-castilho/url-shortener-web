import { describe, expect, it } from "vitest";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw";
import LinksPage from "@/pages/LinksPage";
import { renderWithProviders } from "@/test/render";
import { server } from "@/test/setup";

describe("LinksPage", () => {
  it("empty state shows copy and link to home", async () => {
    server.use(
      http.get("/api/v1/urls", () =>
        HttpResponse.json({ items: [], nextCursor: null, hasMore: false }),
      ),
    );

    renderWithProviders(<LinksPage />);

    expect(await screen.findByText("No links yet.")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Shorten a URL" })).toBeInTheDocument();
  });

  it("lists links and loads more when hasMore", async () => {
    const user = userEvent.setup();
    renderWithProviders(<LinksPage />);

    expect(await screen.findByRole("link", { name: "abc123" })).toBeInTheDocument();
    expect(screen.getByText("https://example.com")).toBeInTheDocument();
    expect(screen.getByText(/Clicks: 5/)).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Load more" }));

    expect(await screen.findByText("https://second.example")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Mais" })).not.toBeInTheDocument();
  });
});