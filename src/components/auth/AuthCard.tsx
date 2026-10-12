import type { ReactNode } from "react";

export function AuthCard({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <section className="relative rounded-2xl border border-border/80 dark:border-white/10 bg-card/92 dark:bg-card/85 p-5 sm:p-8 shadow-2xl backdrop-blur-xl transition-all">
      <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-[26px]">
        {title}
      </h1>
      {description ? (
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          {description}
        </p>
      ) : null}
      <div className="mt-6">{children}</div>
    </section>
  );
}
