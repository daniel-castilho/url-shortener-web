import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw";
import HomePage from "@/pages/HomePage";
import { renderWithProviders } from "@/test/render";
import { server } from "@/test/setup";

beforeEach(() => {
  Object.defineProperty(navigator, "clipboard", {
    value: { writeText: vi.fn().mockResolvedValue(undefined) },
    configurable: true,
  });
});

afterEach(() => {
  vi.restoreAllMocks();
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
});