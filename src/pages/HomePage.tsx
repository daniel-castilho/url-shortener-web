import { useState, type FormEvent } from "react";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { ApiErrorMessage } from "@/components/ApiErrorMessage";
import { api } from "@/lib/api";

export default function HomePage() {
  const [originalUrl, setOriginalUrl] = useState("");
  const [customAlias, setCustomAlias] = useState("");
  const shorten = useMutation({ mutationFn: api.shorten });
  function onSubmit(e: FormEvent) {
    e.preventDefault();
    shorten.mutate({ originalUrl, customAlias: customAlias || null });
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
      <input
        className="w-full rounded-md border border-input px-3 py-2"
        placeholder="alias opcional"
        value={customAlias}
        onChange={(e) => setCustomAlias(e.target.value)}
      />
      <Button type="submit" disabled={shorten.isPending}>
        Encurtar
      </Button>
      {shorten.data && <p className="break-all text-sm">{shorten.data.shortUrl}</p>}
      {shorten.error && <ApiErrorMessage error={shorten.error} />}
    </form>
  );
}
