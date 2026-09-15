import { toBarPoints } from "@/lib/analytics";

type ClicksChartProps = {
  series: Array<{ time: string; clicks: number }>;
  totalClicks: number;
};

export function ClicksChart({ series, totalClicks }: ClicksChartProps) {
  const bars = toBarPoints(series);

  if (bars.length === 0 || bars.every((b) => b.clicks === 0)) {
    return <p className="text-sm text-muted-foreground">No clicks in this period.</p>;
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium">Clicks in the last 30 days</span>
        <span className="text-muted-foreground">
          Total in window: {totalClicks}
        </span>
      </div>
      <div className="flex flex-col gap-2">
        {bars.map((b, i) => (
          <div key={i} className="flex items-center gap-2">
            <span className="w-16 text-sm text-muted-foreground shrink-0">{b.label}</span>
            <div className="flex-1 h-4 bg-muted rounded relative overflow-hidden">
              <div
                className="bg-primary h-full rounded"
                style={{ width: `${Math.round(b.ratio * 100)}%` }}
              />
            </div>
            <span className="w-12 text-sm text-muted-foreground text-right shrink-0">
              {b.clicks}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}