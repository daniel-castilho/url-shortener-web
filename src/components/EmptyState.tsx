import type { ReactNode } from "react";

export function EmptyState({ title, action }: { title: string; action?: ReactNode }) {
  return (
    <div className="space-y-2 rounded-xl border border-dashed p-8 text-center">
      <p className="text-sm text-muted-foreground">{title}</p>
      {action}
    </div>
  );
}
