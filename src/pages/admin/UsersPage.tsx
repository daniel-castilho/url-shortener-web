import { Link } from "react-router-dom";
import { useState } from "react";
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/EmptyState";
import { ApiErrorMessage } from "@/components/ApiErrorMessage";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api";
import { type AdminUserResponse } from "@/lib/api";

export default function UsersPage() {
  const { user } = useAuth();
  const currentUserId = user?.userId;
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

  const [blockTarget, setBlockTarget] = useState<string | null>(null);
  const [unblockTarget, setUnblockTarget] = useState<string | null>(null);

  const handleBlock = () => {
    if (blockTarget) {
      api.adminBlock(blockTarget);
      setBlockTarget(null);
      q.refetch();
    }
  };

  const handleUnblock = () => {
    if (unblockTarget) {
      api.adminUnblock(unblockTarget);
      setUnblockTarget(null);
      q.refetch();
    }
  };

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
                <div className="col-span-3">Email</div>
                <div className="col-span-2">Name</div>
                <div className="col-span-2">Role</div>
                <div className="col-span-2">Status</div>
                <div className="col-span-2">Created</div>
                <div className="col-span-1">Actions</div>
              </div>
              {items.map((u: AdminUserResponse) => (
                <div key={u.userId} className="grid grid-cols-12 gap-4 px-4 py-3 text-sm border-b hover:bg-muted/50">
                  <Link to={`/admin/users/${u.userId}`} className="col-span-3 truncate">{u.email}</Link>
                  <div className="col-span-2 truncate">{u.name}</div>
                  <div className="col-span-2">
                    <span className={u.role === "ADMIN" ? "text-primary" : "text-muted-foreground"}>
                      {u.role}
                    </span>
                  </div>
                  <div className="col-span-2">
                    <span className={u.blocked ? "text-destructive" : "text-green-600"}>
                      {u.blocked ? "Blocked" : "Active"}
                    </span>
                  </div>
                  <div className="col-span-2 text-muted-foreground">{u.createdAt}</div>
                  <div className="col-span-1 flex items-center gap-2">
                    {u.userId !== currentUserId && u.blocked && (
                      <Button
                        type="button"
                        variant="default"
                        className="h-8 px-3 text-xs"
                        onClick={() => setUnblockTarget(u.userId)}
                      >
                        Unblock
                      </Button>
                    )}
                    {u.userId !== currentUserId && !u.blocked && (
                      <Button
                        type="button"
                        variant="default"
                        className="bg-destructive hover:bg-destructive/90 text-destructive-foreground h-8 px-3 text-xs"
                        onClick={() => setBlockTarget(u.userId)}
                      >
                        Block
                      </Button>
                    )}
                  </div>
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
      <Dialog open={!!blockTarget} onOpenChange={() => setBlockTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Block this user?</DialogTitle>
            <DialogDescription>
              The user will not be able to log in or create new links.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setBlockTarget(null)}>
              Cancel
            </Button>
            <Button type="button" variant="default" className="bg-destructive hover:bg-destructive/90 text-destructive-foreground" onClick={handleBlock}>
              Block
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <Dialog open={!!unblockTarget} onOpenChange={() => setUnblockTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Unblock this user?</DialogTitle>
            <DialogDescription>
              The user will be able to log in and create links again.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setUnblockTarget(null)}>
              Cancel
            </Button>
            <Button type="button" onClick={handleUnblock}>
              Unblock
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}