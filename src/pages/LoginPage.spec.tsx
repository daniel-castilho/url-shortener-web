import { describe, expect, it } from "vitest";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useAuth } from "@/context/AuthContext";
import LoginPage from "@/pages/LoginPage";
import { renderWithProviders } from "@/test/render";

function HydrationProbe() {
  const { user, isAuthenticated } = useAuth();
  return <p>{isAuthenticated ? `Hello, ${user?.name}` : "anonymous"}</p>;
}

describe("LoginPage", () => {
  it("401 shows mapped copy with request id", async () => {
    const user = userEvent.setup();
    renderWithProviders(<LoginPage />);

    await user.type(screen.getByLabelText("Email"), "fail@example.com");
    await user.type(screen.getByLabelText("Password"), "supersecret");
    await user.click(screen.getByRole("button", { name: "Login" }));

    expect(await screen.findByText("Session expired.")).toBeInTheDocument();
    expect(screen.getByText(/^id: /)).toBeInTheDocument();
  });

  it("200 hydrates user and navigates", async () => {
    const user = userEvent.setup();
    renderWithProviders(
      <>
        <LoginPage />
        <HydrationProbe />
      </>,
    );

    await user.type(screen.getByLabelText("Email"), "test@example.com");
    await user.type(screen.getByLabelText("Password"), "supersecret");
    await user.click(screen.getByRole("button", { name: "Login" }));

    expect(await screen.findByText("Hello, Test User")).toBeInTheDocument();
  });
});