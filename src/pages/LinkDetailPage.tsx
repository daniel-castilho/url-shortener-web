import { useState, type FormEvent } from "react";
import { Link, useParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { ApiErrorMessage } from "@/components/ApiErrorMessage";
import { api } from "@/lib/api";
import { buildPatch } from "@/lib/link-edit";

export default function LinkDetailPage() {
  const { id = "" } = useParams();
  const qc = useQueryClient();
  const q = useQuery({ queryKey: ["url", id], queryFn: () => api.getUrl(id) });
  const [editOpen, setEditOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [tags, setTags] = useState("");
  const [utmSource, setUtmSource] = useState("");
  const [utmMedium, setUtmMedium] = useState("");
  const [utmCampaign, setUtmCampaign] = useState("");
  const [utmTerm, setUtmTerm] = useState("");
  const [utmContent, setUtmContent] = useState("");
  const [expiresAt, setExpiresAt] = useState("");
  const update = useMutation({
    mutationFn: (body: Parameters<typeof api.updateUrl>[1]) => api.updateUrl(id, body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["url", id] });
      qc.invalidateQueries({ queryKey: ["urls"] });
    },
  });
  const archive = useMutation({
    mutationFn: () => api.archiveUrl(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["url", id] });
      qc.invalidateQueries({ queryKey: ["urls"] });
    },
  });
  if (q.isPending) return <p>Carregando</p>;
  if (q.error) return <ApiErrorMessage error={q.error} />;
  if (!q.data) return <p>Link nao encontrado.</p>;
  const link = q.data;
  function onEditOpen() {
    setTitle(link.title ?? "");
    setTags(link.tags ? link.tags.join(", ") : "");
    setUtmSource(link.utm?.source ?? "");
    setUtmMedium(link.utm?.medium ?? "");
    setUtmCampaign(link.utm?.campaign ?? "");
    setUtmTerm(link.utm?.term ?? "");
    setUtmContent(link.utm?.content ?? "");
    setExpiresAt(link.expiresAt ?? "");
    setEditOpen(true);
  }
  function onEditSubmit(e: FormEvent) {
    e.preventDefault();
    const patch = buildPatch({
      title,
      tags,
      utmSource,
      utmMedium,
      utmCampaign,
      utmTerm,
      utmContent,
      expiresAt,
    });
    if (Object.keys(patch).length > 0) update.mutate(patch);
  }
  return (
    <div className="space-y-3">
      <Link className="text-sm underline" to="/links">
        ← Voltar aos links
      </Link>
      <h1 className="break-all text-2xl font-semibold">{link.shortUrl}</h1>
      <p className="break-all">{link.originalUrl}</p>
      <p className="text-sm text-muted-foreground">id: {link.id}</p>
      <p className="text-sm text-muted-foreground">cliques: {link.clickCount}</p>
      {link.title && <p className="text-sm text-muted-foreground">título: {link.title}</p>}
      {link.tags && link.tags.length > 0 && (
        <p className="text-sm text-muted-foreground">tags: {link.tags.join(", ")}</p>
      )}
      {link.expiresAt && (
        <p className="text-sm text-muted-foreground">expira em: {link.expiresAt}</p>
      )}
      <p className="text-sm text-muted-foreground">
        criado em: {link.createdAt}
        {link.deletedAt ? " — arquivado" : ""}
      </p>
      <div className="space-y-1">
        <div className="flex flex-wrap gap-2">
          <Button type="button" variant="outline" onClick={onEditOpen} disabled={!!link.deletedAt}>
            Editar
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => archive.mutate()}
            disabled={!!link.deletedAt || archive.isPending}
          >
            Arquivar
          </Button>
        </div>
        {archive.error && <ApiErrorMessage error={archive.error} />}
      </div>
      {editOpen && (
        <form onSubmit={onEditSubmit} className="mt-4 space-y-3">
          <h2 className="text-lg font-semibold">Editar</h2>
          <input
            className="w-full rounded-md border border-input px-3 py-2"
            placeholder="título"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <input
            className="w-full rounded-md border border-input px-3 py-2"
            placeholder="tags (separadas por vírgula)"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
          />
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <input
              className="rounded-md border border-input px-3 py-2"
              placeholder="utm source"
              value={utmSource}
              onChange={(e) => setUtmSource(e.target.value)}
            />
            <input
              className="rounded-md border border-input px-3 py-2"
              placeholder="utm medium"
              value={utmMedium}
              onChange={(e) => setUtmMedium(e.target.value)}
            />
            <input
              className="rounded-md border border-input px-3 py-2"
              placeholder="utm campaign"
              value={utmCampaign}
              onChange={(e) => setUtmCampaign(e.target.value)}
            />
            <input
              className="rounded-md border border-input px-3 py-2"
              placeholder="utm term"
              value={utmTerm}
              onChange={(e) => setUtmTerm(e.target.value)}
            />
            <input
              className="rounded-md border border-input px-3 py-2"
              placeholder="utm content"
              value={utmContent}
              onChange={(e) => setUtmContent(e.target.value)}
            />
            <input
              className="rounded-md border border-input px-3 py-2"
              placeholder="expira em (date-time)"
              value={expiresAt}
              onChange={(e) => setExpiresAt(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-3">
            <Button type="submit" disabled={update.isPending}>
              Salvar
            </Button>
            <Button type="button" variant="outline" onClick={() => setEditOpen(false)}>
              Cancelar
            </Button>
          </div>
          {update.error && <ApiErrorMessage error={update.error} />}
        </form>
      )}
    </div>
  );
}
