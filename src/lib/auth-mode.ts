function getAuthMode(): string {
  if (typeof import.meta !== "undefined" && import.meta.env?.VITE_AUTH_MODE) {
    return import.meta.env.VITE_AUTH_MODE;
  }
  if (typeof process !== "undefined" && process.env?.VITE_AUTH_MODE) {
    return process.env.VITE_AUTH_MODE;
  }
  return "bearer";
}

export function isCookieAuth(): boolean {
  return getAuthMode() === "cookie";
}