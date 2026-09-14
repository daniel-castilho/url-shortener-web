import { describe, expect, it } from "vitest";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useAuth } from "@/context/AuthContext";
import LoginPage from "@/pages/LoginPage";
import { renderWithProviders } from "@/test/render";

function HydrationProbe() {
  const { user, isAuthenticated } = useAuth();
  return <p>{isAuthenticated ? `Olá, ${user?.name}` : "anonimo"}</p>;
}

describe("LoginPage", () => {
  it("401 mostra a cópia mapeada com o id do request", async () => {
    const user = userEvent.setup();
    renderWithProviders(<LoginPage />);

    await user.type(screen.getByLabelText("Email"), "fail@example.com");
    await user.type(screen.getByLabelText("Senha"), "supersecret");
    await user.click(screen.getByRole("button", { name: "Login" }));

    expect(await screen.findByText("Sessão expirada.")).toBeInTheDocument();
    expect(screen.getByText(/^id: /)).toBeInTheDocument();
  });

  it("200 hidrata o usuário e navega", async () => {
    const user = userEvent.setup();
    renderWithProviders(
      <>
        <LoginPage />
        <HydrationProbe />
      </>,
    );

    await user.type(screen.getByLabelText("Email"), "test@example.com");
    await user.type(screen.getByLabelText("Senha"), "supersecret");
    await user.click(screen.getByRole("button", { name: "Login" }));

    expect(await screen.findByText("Olá, Test User")).toBeInTheDocument();
  });
});