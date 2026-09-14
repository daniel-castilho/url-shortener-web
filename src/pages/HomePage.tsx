import { useState, type FormEvent } from "react";
import { useMutation } from "@tanstack/react-query";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { ApiErrorMessage } from "@/components/ApiErrorMessage";
import { api } from "@/lib/api";
import { isValidHttpUrl } from "@/lib/url";

export default function HomePage() {
  const { isAuthenticated } = useAuth();
  const [originalUrl, setOriginalUrl] = useState("");
  const [customAlias, setCustomAlias] = useState("");
  const [ttlSeconds, setTtlSeconds] = useState("");
  const [urlError, setUrlError] = useState<string | null>(null);
  const shorten = useMutation({ mutationFn: api.shorten });
  function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!isValidHttpUrl(originalUrl)) {
      setUrlError("URL inválida. Use http:// ou https://");
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
      <h1 className="text-2xl font-semibold">Encurtar URL</h1>
      <input
        className="w-full rounded-md border border-input px-3 py-2"
        type="url"
        required
        placeholder="https://"
        value={originalUrl}
        onChange={(e) => setOriginalUrl(e.target.value)}
      />
      {isAuthenticated && (
        <input
          className="w-full rounded-md border border-input px-3 py-2"
          placeholder="alias opcional"
          value={customAlias}
          onChange={(e) => setCustomAlias(e.target.value)}
        />
      )}
      {isAuthenticated && (
        <input
          className="w-full rounded-md border border-input px-3 py-2"
          type="number"
          min={1}
          step={1}
          placeholder="ttl em segundos (opcional)"
          value={ttlSeconds}
          onChange={(e) => setTtlSeconds(e.target.value)}
        />
      )}
      <Button type="submit" disabled={shorten.isPending}>
        Encurtar
      </Button>
      {urlError && <p className="text-sm text-destructive">{urlError}</p>}
      {shorten.data && <p className="break-all text-sm">{shorten.data.shortUrl}</p>}
      {shorten.error && <ApiErrorMessage error={shorten.error} />}
    </form>
  );
}
