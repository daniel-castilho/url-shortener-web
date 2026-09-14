import type { ClickSeriesPoint } from "./api";

export function formatClickCount(n: number): string {
  if (!Number.isFinite(n)) return "0";
  return new Intl.NumberFormat("pt-BR").format(Math.max(0, Math.floor(n)));
}

export function toBarPoints(points: ClickSeriesPoint[]): Array<{
  time: string;
  clicks: number;
  ratio: number;
  label: string;
}> {
  if (!points || points.length === 0) return [];
  const max = Math.max(...points.map((p) => p.clicks));
  return points.map((p) => ({
    time: p.time,
    clicks: p.clicks,
    ratio: max > 0 ? Math.max(0, Math.min(1, p.clicks / max)) : 0,
    label: formatDateLabel(p.time),
  }));
}

function formatDateLabel(iso: string): string {
  try {
    const d = new Date(iso);
    return new Intl.DateTimeFormat("pt-BR", {
      day: "2-digit",
      month: "2-digit",
    }).format(d);
  } catch {
    return iso;
  }
}