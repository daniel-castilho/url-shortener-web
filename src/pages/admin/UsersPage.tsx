import { useInfiniteQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/EmptyState";
import { ApiErrorMessage } from "@/components/ApiErrorMessage";
import { api } from "@/lib/api";
import { type AdminUserResponse } from "@/lib/api";

export default function UsersPage() {
  const q = useInfiniteQuery({
    queryKey: ["admin", "users"],
    queryFn: ({ pageParam }) => api.adminUsers(20, pageParam),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => (lastPage.hasMore ? lastPage.nextCursor : undefined),
  });

  if (q.isPending) return <p>Loading</p>;
  if (q.error) return <ApiErrorMessage error={q.error} />;

  const items = q.data.pages.flatMap((page) => page.items);

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-xl font-semibold">Users</CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          {items.length === 0 ? (
            <EmptyState title="No users yet." />
          ) : (
            <div className="space-y-2">
              <div className="grid grid-cols-12 gap-4 px-4 py-3 text-sm font-medium text-muted-foreground border-b">
                <div className="col-span-4">Email</div>
                <div className="col-span-2">Name</div>
                <div className="col-span-2">Role</div>
                <div className="col-span-2">Status</div>
                <div className="col-span-2">Created</div>
              </div>
              {items.map((user: AdminUserResponse) => (
                <div key={user.userId} className="grid grid-cols-12 gap-4 px-4 py-3 text-sm border-b">
                  <div className="col-span-4 truncate">{user.email}</div>
                  <div className="col-span-2 truncate">{user.name}</div>
                  <div className="col-span-2">
                    <span className={user.role === "ADMIN" ? "text-primary" : "text-muted-foreground"}>
                      {user.role}
                    </span>
                  </div>
                  <div className="col-span-2">
                    <span className={user.blocked ? "text-destructive" : "text-green-600"}>
                      {user.blocked ? "Blocked" : "Active"}
                    </span>
                  </div>
                  <div className="col-span-2 text-muted-foreground">{user.createdAt}</div>
                </div>
              ))}
            </div>
          )}
          {q.hasNextPage && (
            <Button
              type="button"
              variant="outline"
              className="mt-4"
              onClick={() => q.fetchNextPage()}
              disabled={q.isFetchingNextPage}
            >
              Load more
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
}