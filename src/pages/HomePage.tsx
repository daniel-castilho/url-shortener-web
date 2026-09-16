import { useState, type FormEvent } from "react";
import { useMutation } from "@tanstack/react-query";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ApiErrorMessage } from "@/components/ApiErrorMessage";
import { api } from "@/lib/api";
import { isValidHttpUrl } from "@/lib/url";

export default function HomePage() {
  const { isAuthenticated } = useAuth();
  const [originalUrl, setOriginalUrl] = useState("");
  const [customAlias, setCustomAlias] = useState("");
  const [ttlSeconds, setTtlSeconds] = useState("");
  const [urlError, setUrlError] = useState<string | null>(null);
  const [copyState, setCopyState] = useState<"idle" | "copied" | "failed">("idle");
  const shorten = useMutation({ mutationFn: api.shorten });
  async function onCopy(shortUrl: string) {
    try {
      await navigator.clipboard.writeText(shortUrl);
      setCopyState("copied");
    } catch {
      setCopyState("failed");
    }
  }
  function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!isValidHttpUrl(originalUrl)) {
      setUrlError("Invalid URL. Use http:// or https://");
      return;
    }
    setUrlError(null);
    shorten.mutate({
      originalUrl,
      ...(customAlias ? { customAlias } : {}),
      ...(ttlSeconds ? { ttlSeconds: Number(ttlSeconds) } : {}),
    });
  }
  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <h1 className="text-2xl font-semibold">Shorten URL</h1>
      <div className="space-y-2">
        <Label htmlFor="originalUrl">URL</Label>
        <Input
          id="originalUrl"
          type="url"
          required
          placeholder="https://"
          value={originalUrl}
          onChange={(e) => setOriginalUrl(e.target.value)}
        />
      </div>
      {isAuthenticated && (
        <div className="space-y-2">
          <Label htmlFor="customAlias">Alias (optional)</Label>
          <Input
            id="customAlias"
            placeholder="optional alias"
            value={customAlias}
            onChange={(e) => setCustomAlias(e.target.value)}
          />
        </div>
      )}
      {isAuthenticated && (
        <div className="space-y-2">
          <Label htmlFor="ttlSeconds">Expires in (seconds, optional)</Label>
          <Input
            id="ttlSeconds"
            type="number"
            min={1}
            step={1}
            placeholder="ttl in seconds"
            value={ttlSeconds}
            onChange={(e) => setTtlSeconds(e.target.value)}
          />
        </div>
      )}
      <Button type="submit" disabled={shorten.isPending}>
        Shorten
      </Button>
      {urlError && <p className="text-sm text-destructive">{urlError}</p>}
      {shorten.data && (
        <div className="space-y-2">
          <p className="break-all text-sm">{shorten.data.shortUrl}</p>
          <div className="flex flex-wrap items-center gap-3">
            <Button type="button" variant="outline" onClick={() => onCopy(shorten.data.shortUrl)}>
              Copy
            </Button>
            {copyState === "copied" && <span className="text-sm text-muted-foreground">Copied!</span>}
            {copyState === "failed" && <span className="text-sm text-destructive">Failed to copy.</span>}
          </div>
        </div>
      )}
      {shorten.error && <ApiErrorMessage error={shorten.error} />}
    </form>
  );
}
