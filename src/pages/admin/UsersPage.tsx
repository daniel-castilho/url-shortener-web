import { Link } from "react-router-dom";
import { useState } from "react";
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/EmptyState";
import { ApiErrorMessage } from "@/components/ApiErrorMessage";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { api } from "@/lib/api";
import { type AdminUserResponse } from "@/lib/api";

export default function UsersPage() {
  const q = useInfiniteQuery({
    queryKey: ["admin", "users"],
    queryFn: ({ pageParam }) => api.adminUsers(20, pageParam),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => (lastPage.hasMore ? lastPage.nextCursor : undefined),
  });

  const [code, setCode] = useState("");
  const codeQuery = useQuery({
    queryKey: ["admin", "code", code],
    queryFn: () => api.adminUrlByCode(code),
    enabled: code.length > 0,
  });

  if (q.isPending) return <p>Loading</p>;
  if (q.error) return <ApiErrorMessage error={q.error} />;

  const items = q.data.pages.flatMap((page) => page.items);

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="flex flex-col items-start gap-4">
          <CardTitle className="text-xl font-semibold">Users</CardTitle>
          <div className="w-full max-w-md">
            <Label htmlFor="code-search" className="text-sm font-medium">Search by short code</Label>
            <div className="flex gap-2 mt-1">
              <Input
                id="code-search"
                placeholder="e.g., abc123"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="flex-1"
              />
              <Button type="button" onClick={() => setCode("")} variant="outline" disabled={!code}>
                Clear
              </Button>
            </div>
            {codeQuery.isPending && <p className="text-sm text-muted-foreground mt-1">Searching…</p>}
            {codeQuery.error && <ApiErrorMessage error={codeQuery.error} />}
            {codeQuery.data && (
              <div className="mt-2 p-3 rounded border bg-muted/50">
                <p className="font-medium">Found: {codeQuery.data.shortUrl}</p>
                <p className="text-sm text-muted-foreground">Owner: {codeQuery.data.ownerEmail ?? "unknown"} ({codeQuery.data.ownerUserId})</p>
                <p className="text-sm text-muted-foreground">Original: {codeQuery.data.originalUrl}</p>
                <p className="text-sm text-muted-foreground">Clicks: {codeQuery.data.clickCount}</p>
                <p className="text-sm text-muted-foreground">{codeQuery.data.deletedAt ? "Archived" : "Active"}</p>
              </div>
            )}
          </div>
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
                <Link key={user.userId} to={`/admin/users/${user.userId}`} className="grid grid-cols-12 gap-4 px-4 py-3 text-sm border-b hover:bg-muted/50">
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
                </Link>
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