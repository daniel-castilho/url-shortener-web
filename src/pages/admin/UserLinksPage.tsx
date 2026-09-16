import { useState } from "react";
import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/EmptyState";
import { ApiErrorMessage } from "@/components/ApiErrorMessage";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { api } from "@/lib/api";
import { type ShortUrlResponse } from "@/lib/api";

export default function UserLinksPage() {
  const { userId = "" } = useParams();
  const q = useQuery({
    queryKey: ["admin", "user", userId, "urls"],
    queryFn: () => api.adminUserUrls(userId),
    enabled: !!userId,
  });

  const [confirmArchive, setConfirmArchive] = useState<string | null>(null);

  if (q.isPending) return <p>Loading</p>;
  if (q.error) return <ApiErrorMessage error={q.error} />;
  if (!q.data) return <p>User not found.</p>;

  const items = q.data.items;

  const handleArchive = (id: string) => {
    setConfirmArchive(id);
  };

  const executeArchive = () => {
    if (confirmArchive) {
      api.adminForceArchive(confirmArchive);
      setConfirmArchive(null);
      q.refetch();
    }
  };

  return (
    <div className="space-y-4">
      <Link className="text-sm underline underline-offset-4" to="/admin/users">
        ← Back to users
      </Link>
      <Card>
        <CardHeader>
          <CardTitle className="text-xl font-semibold">User's links</CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          {items.length === 0 ? (
            <EmptyState title="No links for this user." />
          ) : (
            <div className="space-y-2">
              <div className="grid grid-cols-12 gap-4 px-4 py-3 text-sm font-medium text-muted-foreground border-b">
                <div className="col-span-3">Short URL</div>
                <div className="col-span-4">Original URL</div>
                <div className="col-span-2">Clicks</div>
                <div className="col-span-2">Status</div>
                <div className="col-span-1"></div>
              </div>
              {items.map((link: ShortUrlResponse) => (
                <div key={link.id} className="grid grid-cols-12 gap-4 px-4 py-3 text-sm border-b">
                  <div className="col-span-3 truncate">
                    <Link to={`/links/${link.id}`} className="font-medium underline underline-offset-4">
                      {link.shortUrl}
                    </Link>
                  </div>
                  <div className="col-span-4 truncate text-muted-foreground">{link.originalUrl}</div>
                  <div className="col-span-2 text-muted-foreground">{link.clickCount}</div>
                  <div className="col-span-2">
                    {link.deletedAt ? (
                      <span className="text-destructive">Archived</span>
                    ) : (
                      <span className="text-green-600">Active</span>
                    )}
                  </div>
                  <div className="col-span-1">
                    {!link.deletedAt && (
                      <Button
                        type="button"
                        variant="default"
                        className="bg-destructive hover:bg-destructive/90 text-destructive-foreground h-8 px-3 text-xs"
                        onClick={() => handleArchive(link.id)}
                      >
                        Archive
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
      <Dialog open={!!confirmArchive} onOpenChange={() => setConfirmArchive(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Force-archive this link?</DialogTitle>
            <DialogDescription>
              The link {confirmArchive} will be archived. This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setConfirmArchive(null)}>
              Cancel
            </Button>
            <Button type="button" variant="default" className="bg-destructive hover:bg-destructive/90 text-destructive-foreground" onClick={executeArchive}>
              Archive
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}