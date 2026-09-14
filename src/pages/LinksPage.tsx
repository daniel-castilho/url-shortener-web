import { useInfiniteQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/EmptyState";
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
        <EmptyState
          title="Nenhum link ainda."
          action={
            <Link className="text-sm underline underline-offset-4" to="/">
              Encurtar uma URL
            </Link>
          }
        />
      ) : (
        <ul className="space-y-2">
          {items.map((item) => (
            <li key={item.id}>
              <Card className="gap-2 py-4">
                <CardContent className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 px-4">
                  <div className="min-w-0 space-y-1">
                    <Link className="font-medium underline underline-offset-4" to={`/links/${item.id}`}>
                      {item.id}
                    </Link>
                    <p className="truncate text-sm text-muted-foreground">{item.originalUrl}</p>
                  </div>
                  <p className="text-sm text-muted-foreground">cliques: {item.clickCount}</p>
                </CardContent>
              </Card>
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
