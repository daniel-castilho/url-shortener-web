import { Link, useParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { ApiErrorMessage } from "@/components/ApiErrorMessage";
import { api } from "@/lib/api";

export default function LinkDetailPage() {
  const { id = "" } = useParams();
  const qc = useQueryClient();
  const q = useQuery({ queryKey: ["url", id], queryFn: () => api.getUrl(id) });
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
        <Button
          type="button"
          variant="outline"
          onClick={() => archive.mutate()}
          disabled={!!link.deletedAt || archive.isPending}
        >
          Arquivar
        </Button>
        {archive.error && <ApiErrorMessage error={archive.error} />}
      </div>
    </div>
  );
}
