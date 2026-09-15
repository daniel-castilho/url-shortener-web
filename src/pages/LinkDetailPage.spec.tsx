import { describe, expect, it } from "vitest";
import { screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw";
import LinkDetailPage from "@/pages/LinkDetailPage";
import { renderWithProviders } from "@/test/render";
import { server } from "@/test/setup";
import { makeLink } from "@/test/handlers";

describe("LinkDetailPage", () => {
  it("shows the link and click analysis", async () => {
    renderWithProviders(<LinkDetailPage />, {
      initialEntries: ["/links/abc123"],
      routePath: "/links/:id",
    });

    expect(await screen.findByText("https://tyny.url/abc123")).toBeInTheDocument();
    expect(screen.getByText(/ID: abc123/)).toBeInTheDocument();
    expect(screen.getByText("Test Link")).toBeInTheDocument();
    expect(await screen.findByText("Clicks in the last 30 days")).toBeInTheDocument();
  });

  it("PATCH sends only filled fields", async () => {
    let patchBody: string | null = null;
    server.use(
      http.patch("/api/v1/urls/:id", async ({ request }) => {
        patchBody = await request.text();
        return HttpResponse.json(makeLink());
      }),
    );

    const user = userEvent.setup();
    renderWithProviders(<LinkDetailPage />, {
      initialEntries: ["/links/abc123"],
      routePath: "/links/:id",
    });

    await user.click(await screen.findByRole("button", { name: "Edit" }));
    await user.type(screen.getByLabelText("Title"), "New title");
    await user.click(screen.getByRole("button", { name: "Save" }));

    expect(await screen.findByText("Saved.")).toBeInTheDocument();
    const sent = JSON.parse(patchBody ?? "{}") as Record<string, unknown>;
    expect(Object.keys(sent)).toEqual(["title"]);
    expect(sent["title"]).toBe("New title");
  });

  it("confirms archive in dialog", async () => {
    let archiveCalls = 0;
    server.use(
      http.delete("/api/v1/urls/:id", () => {
        archiveCalls += 1;
        return new HttpResponse(null, { status: 204 });
      }),
    );

    const user = userEvent.setup();
    renderWithProviders(<LinkDetailPage />, {
      initialEntries: ["/links/abc123"],
      routePath: "/links/:id",
    });

    await user.click(await screen.findByRole("button", { name: "Archive" }));

    const dialog = await screen.findByRole("dialog");
    expect(within(dialog).getByText("Archive this link?")).toBeInTheDocument();

    await user.click(within(dialog).getByRole("button", { name: "Archive" }));

    expect(await screen.findByText("Archived.")).toBeInTheDocument();
    expect(archiveCalls).toBe(1);
  });
});