import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw";
import HomePage from "@/pages/HomePage";
import { renderWithProviders } from "@/test/render";
import { server } from "@/test/setup";
import { getLastShortenRequest, resetLastShortenRequest } from "@/test/handlers";

beforeEach(() => {
  Object.defineProperty(navigator, "clipboard", {
    value: { writeText: vi.fn().mockResolvedValue(undefined) },
    configurable: true,
  });
  resetLastShortenRequest();
  sessionStorage.setItem("us.token", "test-token");
  sessionStorage.setItem("us.user", JSON.stringify({ userId: "1", email: "test@example.com", name: "Test User" }));
});

afterEach(() => {
  vi.restoreAllMocks();
  sessionStorage.clear();
});

describe("HomePage", () => {
  it("invalid URL does not call MSW", async () => {
    let shortenCalls = 0;
    server.use(
      http.post("/api/v1/urls", async () => {
        shortenCalls += 1;
        return HttpResponse.json(
          { id: "x", shortUrl: "https://tyny.url/x" },
          { status: 201 },
        );
      }),
    );

    const user = userEvent.setup();
    renderWithProviders(<HomePage />);

    await user.type(screen.getByLabelText("URL"), "ftp://example.com");
    await user.click(screen.getByRole("button", { name: "Shorten" }));

    expect(await screen.findByText("Invalid URL. Use http:// or https://")).toBeInTheDocument();
    expect(shortenCalls).toBe(0);
    expect(screen.queryByText("https://tyny.url/abc123")).not.toBeInTheDocument();
  });

  it("201 shows shortUrl and confirms copy", async () => {
    const user = userEvent.setup();
    renderWithProviders(<HomePage />);

    await user.type(screen.getByLabelText("URL"), "https://example.com/very/long/path");
    await user.click(screen.getByRole("button", { name: "Shorten" }));

    expect(await screen.findByText("https://tyny.url/abc123")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Copy" }));
    expect(await screen.findByText("Copied!")).toBeInTheDocument();
  });

  it("429 with Retry-After shows N seconds", async () => {
    const user = userEvent.setup();
    renderWithProviders(<HomePage />);

    await user.type(screen.getByLabelText("URL"), "https://ratelimit.example.com");
    await user.click(screen.getByRole("button", { name: "Shorten" }));

    expect(await screen.findByText("Too many requests. Try in 7s.")).toBeInTheDocument();
  });

  it("alias of exactly 64 characters is accepted and sent to API", async () => {
    const user = userEvent.setup();
    renderWithProviders(<HomePage />);

    await user.type(screen.getByLabelText("URL"), "https://example.com");
    const alias64 = "a".repeat(64);
    await user.type(screen.getByLabelText("Alias (optional, max 64 characters)"), alias64);
    await user.click(screen.getByRole("button", { name: "Shorten" }));

    expect(await screen.findByText("https://tyny.url/abc123")).toBeInTheDocument();
    const lastBody = getLastShortenRequest();
    expect(lastBody).not.toBeNull();
    expect((lastBody as Record<string, unknown>).customAlias).toBe(alias64);
  });

  it("alias of 65 characters is rejected client-side without calling API", async () => {
    const user = userEvent.setup();
    renderWithProviders(<HomePage />);

    await user.type(screen.getByLabelText("URL"), "https://example.com");
    const aliasInput = screen.getByLabelText("Alias (optional, max 64 characters)");
    const alias65 = "a".repeat(65);
    // Directly set value to 65 chars to bypass maxLength attribute
    fireEvent.change(aliasInput, { target: { value: alias65 } });
    await user.click(screen.getByRole("button", { name: "Shorten" }));

    expect(await screen.findByText("Alias must be at most 64 characters.")).toBeInTheDocument();
    const lastBody = getLastShortenRequest();
    expect(lastBody).toBeNull();
    expect(screen.queryByText("https://tyny.url/abc123")).not.toBeInTheDocument();
  });

  it("empty alias is omitted from payload", async () => {
    const user = userEvent.setup();
    renderWithProviders(<HomePage />);

    await user.type(screen.getByLabelText("URL"), "https://example.com");
    await user.click(screen.getByRole("button", { name: "Shorten" }));

    expect(await screen.findByText("https://tyny.url/abc123")).toBeInTheDocument();
    const lastBody = getLastShortenRequest();
    expect(lastBody).not.toBeNull();
    expect((lastBody as Record<string, unknown>).customAlias).toBeUndefined();
  });
});