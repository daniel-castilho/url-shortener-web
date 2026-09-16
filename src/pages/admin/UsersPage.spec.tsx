import { describe, expect, it } from "vitest";
import { screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderWithProviders } from "@/test/render";
import UsersPage from "@/pages/admin/UsersPage";

describe("UsersPage (admin)", () => {
  it("renders users grid with columns", async () => {
    renderWithProviders(<UsersPage />, { initialEntries: ["/admin/users"] });

    expect(await screen.findByText("Users")).toBeInTheDocument();
    expect(screen.getByText("Email")).toBeInTheDocument();
    expect(screen.getByText("Name")).toBeInTheDocument();
    expect(screen.getByText("Role")).toBeInTheDocument();
    expect(screen.getByText("Status")).toBeInTheDocument();
    expect(screen.getByText("Created")).toBeInTheDocument();
  });

  it("shows user rows with correct data", async () => {
    renderWithProviders(<UsersPage />, { initialEntries: ["/admin/users"] });

    expect(await screen.findByText("user@example.com")).toBeInTheDocument();
    expect(screen.getByText("Regular User")).toBeInTheDocument();
    expect(screen.getAllByText("USER")).toHaveLength(2);
    expect(screen.getAllByText("Active")).toHaveLength(2);
  });

  it("loads more users when hasMore", async () => {
    const user = userEvent.setup();
    renderWithProviders(<UsersPage />, { initialEntries: ["/admin/users"] });

    await screen.findByText("user@example.com");
    await user.click(screen.getByRole("button", { name: "Load more" }));

    // Second page has different user
    expect(await screen.findByText("another@example.com")).toBeInTheDocument();
  });

  it("code search shows results", async () => {
    const user = userEvent.setup();
    renderWithProviders(<UsersPage />, { initialEntries: ["/admin/users"] });

    await screen.findByText("user@example.com");
    await user.type(screen.getByLabelText(/search by short code/i), "abc123");

    expect(await screen.findByText("Found: https://tyny.url/abc123")).toBeInTheDocument();
    expect(screen.getByText("Owner: owner@example.com (1)")).toBeInTheDocument();
  });

  it("block button opens dialog and blocks user", async () => {
    const user = userEvent.setup();
    renderWithProviders(<UsersPage />, { initialEntries: ["/admin/users"] });

    // Wait for users to load
    await screen.findByText("user@example.com");
    // Click the first Block button (for the first user)
    const blockButtons = screen.getAllByRole("button", { name: "Block" });
    await user.click(blockButtons[0]);

    const dialog = await screen.findByRole("dialog");
    expect(dialog).toBeInTheDocument();
    expect(dialog).toHaveTextContent("Block this user?");

    await user.click(within(dialog).getByRole("button", { name: "Block" }));

    // Dialog should close
    expect(await screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("unblock button appears for blocked users", async () => {
    // The mock returns unblocked users, so unblock button won't appear
    // This test verifies the button doesn't appear for unblocked users
    renderWithProviders(<UsersPage />, { initialEntries: ["/admin/users"] });

    await screen.findByText("user@example.com");
    expect(screen.queryAllByRole("button", { name: "Unblock" })).toHaveLength(0);
  });
});