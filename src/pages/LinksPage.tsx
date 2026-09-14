import { useInfiniteQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ApiErrorMessage } from "@/components/ApiErrorMessage";
import { api } from "@/lib/api";

export default function LinksPage() {
  const q = useInfiniteQuery({
    queryKey: ["urls"],
    queryFn: ({ pageParam }) => api.listUrls(20, pageParam),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => (lastPage.hasMore ? lastPage.nextCursor : undefined),
  });
  if (q.isPending) return <p>Carregando</p>;
  if (q.error) return <ApiErrorMessage error={q.error} />;
  const items = q.data.pages.flatMap((page) => page.items);
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Meus links</h1>
      {items.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          Nenhum link ainda.{" "}
          <Link className="underline" to="/">
            Encurtar uma URL
          </Link>
        </p>
      ) : (
        <ul className="space-y-2">
          {items.map((item) => (
            <li key={item.id}>
              <Link className="underline" to={`/links/${item.id}`}>
                {item.id}
              </Link>
              <span className="ml-2 text-sm text-muted-foreground">{item.originalUrl}</span>
            </li>
          ))}
        </ul>
      )}
      {q.hasNextPage && (
        <Button
          type="button"
          variant="outline"
          onClick={() => q.fetchNextPage()}
          disabled={q.isFetchingNextPage}
        >
          Mais
        </Button>
      )}
    </div>
  );
}
