import { describe, expect, it } from "vitest";
import { screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import UserLinksPage from "@/pages/admin/UserLinksPage";
import { renderWithProviders } from "@/test/render";

describe("UserLinksPage (admin)", () => {
  it("shows user's links including archived", async () => {
    renderWithProviders(<UserLinksPage />, {
      initialEntries: ["/admin/users/2"],
      routePath: "/admin/users/:userId",
    });

    expect(await screen.findByText("User's links")).toBeInTheDocument();
    expect(await screen.findByText("https://tyny.url/link1")).toBeInTheDocument();
    expect(screen.getByText("https://tyny.url/link2")).toBeInTheDocument();
    expect(screen.getByText("Active")).toBeInTheDocument();
    expect(screen.getByText("Archived")).toBeInTheDocument();
  });

  it("force archive opens dialog and archives link", async () => {
    const user = userEvent.setup();
    renderWithProviders(<UserLinksPage />, {
      initialEntries: ["/admin/users/2"],
      routePath: "/admin/users/:userId",
    });

    await screen.findByText("https://tyny.url/link1");
    await user.click(screen.getByRole("button", { name: "Archive" }));

    const dialog = await screen.findByRole("dialog");
    expect(dialog).toBeInTheDocument();
    expect(dialog).toHaveTextContent("Force-archive this link?");

    await user.click(within(dialog).getByRole("button", { name: "Archive" }));

    expect(await screen.findByText("Archived")).toBeInTheDocument();
  });

  it("back to users link is present", async () => {
    renderWithProviders(<UserLinksPage />, {
      initialEntries: ["/admin/users/2"],
      routePath: "/admin/users/:userId",
    });

    await screen.findByText("https://tyny.url/link1");
    expect(screen.getByRole("link", { name: /← back to users/i })).toBeInTheDocument();
  });
});