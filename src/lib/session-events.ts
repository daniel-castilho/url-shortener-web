type SessionEvent = { type: "cleared" | "refreshed" };

const listeners = new Set<(e: SessionEvent) => void>();

export function subscribeSession(handler: (e: SessionEvent) => void): () => void {
  listeners.add(handler);
  return () => listeners.delete(handler);
}

export function emitSession(event: SessionEvent): void {
  listeners.forEach((h) => h(event));
}