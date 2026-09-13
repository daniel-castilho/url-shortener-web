import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { api } from "@/lib/api";

export default function LinksPage() {
  const q = useQuery({ queryKey: ["urls"], queryFn: () => api.listUrls() });
  if (q.isPending) return <p>Carregando</p>;
  if (q.error) return <p className="text-destructive">Faca login para listar os links.</p>;
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Meus links</h1>
      <ul className="space-y-2">
        {q.data.items.map((item) => (
          <li key={item.id}>
            <Link className="underline" to={`/links/${item.id}`}>{item.id}</Link>
            <span className="ml-2 text-sm text-muted-foreground">{item.originalUrl}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
