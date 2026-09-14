import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { api, ApiError } from "@/lib/api";
import { mapApiError } from "@/lib/errors";

export default function LinksPage() {
  const q = useQuery({ queryKey: ["urls"], queryFn: () => api.listUrls() });
  if (q.isPending) return <p>Carregando</p>;
  if (q.error) {
    const err = q.error;
    if (err instanceof ApiError) {
      return (
        <div className="space-y-1">
          <p className="text-destructive">{mapApiError(err.status)}</p>
          {err.requestId && <p className="text-xs text-muted-foreground">id: {err.requestId}</p>}
        </div>
      );
    }
    return <p className="text-destructive">{String(err)}</p>;
  }
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Meus links</h1>
      <ul className="space-y-2">
        {q.data.items.map((item) => (
          <li key={item.id}>
            <Link className="underline" to={`/links/${item.id}`}>
              {item.id}
            </Link>
            <span className="ml-2 text-sm text-muted-foreground">{item.originalUrl}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
