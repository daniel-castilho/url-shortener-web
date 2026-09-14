import { afterAll, afterEach, beforeAll } from "vitest";
import { cleanup } from "@testing-library/react";
import { setupServer } from "msw/node";
import "@testing-library/jest-dom/vitest";
import { handlers } from "./handlers";

export const server = setupServer(...handlers);

beforeAll(() => server.listen({ onUnhandledRequest: "error" }));
afterAll(() => server.close());
afterEach(() => {
  cleanup();
  server.resetHandlers();
});

if (typeof globalThis.ResizeObserver === "undefined") {
  class ResizeObserverPolyfill {
    observe() {}
    unobserve() {}
    disconnect() {}
  }
  Object.defineProperty(globalThis, "ResizeObserver", {
    value: ResizeObserverPolyfill,
    writable: true,
    configurable: true,
  });
}

if (typeof Element !== "undefined" && !Element.prototype.scrollIntoView) {
  Object.defineProperty(Element.prototype, "scrollIntoView", { value: () => {} });
}

if (typeof globalThis.crypto?.randomUUID !== "function") {
  const { randomUUID } = await import("node:crypto");
  Object.defineProperty(globalThis.crypto, "randomUUID", { value: () => randomUUID() });
}