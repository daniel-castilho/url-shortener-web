export function mapApiError(status: number, body?: string, retryAfterSec?: number): string {
  switch (status) {
    case 400:
      return "Invalid data.";
    case 401:
      return "Session expired.";
    case 403:
      if (body && body.includes("Account blocked")) return "Account blocked.";
      return "You are not the owner of this link.";
    case 404:
      return "Link not found.";
    case 409:
      return "This alias already exists.";
    case 429:
      return typeof retryAfterSec === "number"
        ? `Too many requests. Try in ${retryAfterSec}s.`
        : "Too many requests. Please wait a moment.";
    default:
      return "Could not complete the operation.";
  }
}

export function parseRetryAfter(header: string | null): number | undefined {
  if (header === null || !/^\d+$/.test(header)) return undefined;
  const value = Number(header);
  return Number.isFinite(value) ? value : undefined;
}
