import { useParams } from "react-router-dom";
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
    onSuccess: () => qc.invalidateQueries({ queryKey: ["url", id] }),
  });
  if (q.isPending) return <p>Carregando</p>;
  if (q.error) return <ApiErrorMessage error={q.error} />;
  if (!q.data) return <p>Link nao encontrado.</p>;
  const link = q.data;
  return (
    <div className="space-y-3">
      <h1 className="text-2xl font-semibold">{link.id}</h1>
      <p className="break-all">{link.originalUrl}</p>
      <p className="text-sm text-muted-foreground">cliques: {link.clickCount}</p>
      <Button
        type="button"
        variant="outline"
        onClick={() => archive.mutate()}
        disabled={!!link.deletedAt}
      >
        Arquivar
      </Button>
    </div>
  );
}
