import type { ReactNode } from "react";
export function PageHeader({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <header className="flex flex-col flex-wrap gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div className="min-w-0 max-w-full">
        <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
        {description ? (
          <p className="mt-1 text-sm text-muted-foreground">{description}</p>
        ) : null}
      </div>
      {action ? <div className="min-w-0 max-w-full">{action}</div> : null}
    </header>
  );
}
