export function createRefreshCoordinator(doRefresh: () => Promise<boolean>): {
  refresh: () => Promise<boolean>;
} {
  let inFlight: Promise<boolean> | null = null;
  return {
    refresh: () => {
      if (!inFlight) {
        inFlight = doRefresh().finally(() => {
          inFlight = null;
        });
      }
      return inFlight;
    },
  };
}
