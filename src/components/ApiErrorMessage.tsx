import { ApiError } from "@/lib/api";
import { mapApiError } from "@/lib/errors";

export function ApiErrorMessage({ error }: { error: unknown }) {
  if (error instanceof ApiError) {
    return (
      <div className="space-y-1">
        <p className="text-sm text-destructive">{mapApiError(error.status, error.body, error.retryAfterSec)}</p>
        {error.requestId && <p className="text-xs text-muted-foreground">id: {error.requestId}</p>}
      </div>
    );
  }
  return <p className="text-sm text-destructive">{String(error)}</p>;
}
