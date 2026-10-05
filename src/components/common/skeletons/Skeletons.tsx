function Block({ className = "" }: { className?: string }) {
  return <div className={`skeleton-shimmer rounded-md ${className}`} />;
}
export function PageHeaderSkeleton() {
  return (
    <div className="space-y-3">
      <Block className="h-7 w-44" />
      <Block className="h-4 w-72" />
    </div>
  );
}
export function StatCardsSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      {Array.from({ length: count }, (_, i) => (
        <Block key={i} className="h-24" />
      ))}
    </div>
  );
}
export function TableSkeleton({
  rows = 5,
  cols = 4,
}: {
  rows?: number;
  cols?: number;
}) {
  return (
    <div className="space-y-2">
      {Array.from({ length: rows + 1 }, (_, row) => (
        <div key={row} className="flex gap-3">
          {Array.from({ length: cols }, (_, col) => (
            <Block
              key={col}
              className={`h-12 flex-1 ${row === 0 ? "h-9" : ""}`}
            />
          ))}
        </div>
      ))}
    </div>
  );
}
export function CardListSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: rows }, (_, i) => (
        <div
          key={i}
          className="flex h-[88px] items-center gap-3 rounded-xl border bg-card p-4"
        >
          <Block className="size-10 rounded-full" />
          <div className="flex-1 space-y-2">
            <Block className="h-4 w-2/3" />
            <Block className="h-3 w-1/2" />
          </div>
          <Block className="h-5 w-16" />
        </div>
      ))}
    </div>
  );
}
export function ResponsiveListSkeleton() {
  return (
    <>
      <div className="md:hidden">
        <CardListSkeleton />
      </div>
      <div className="hidden md:block">
        <TableSkeleton />
      </div>
    </>
  );
}
export function DetailSkeleton() {
  return (
    <div className="grid gap-4 lg:grid-cols-[2fr_1fr]">
      <Block className="h-72" />
      <Block className="h-72" />
    </div>
  );
}
export function FormSkeleton({ fields = 5 }: { fields?: number }) {
  return (
    <div className="space-y-5">
      {Array.from({ length: fields }, (_, i) => (
        <div key={i} className="space-y-2">
          <Block className="h-4 w-24" />
          <Block className="h-10 w-full" />
        </div>
      ))}
    </div>
  );
}
export function InboxSkeleton() {
  return (
    <div className="grid gap-4 lg:grid-cols-[280px_1fr_240px]">
      <CardListSkeleton rows={6} />
      <Block className="h-[520px]" />
      <Block className="h-[520px]" />
    </div>
  );
}
export function ChatThreadSkeleton() {
  return (
    <div className="space-y-3">
      <Block className="ml-auto h-12 w-2/3" />
      <Block className="h-16 w-3/4" />
      <Block className="ml-auto h-10 w-1/2" />
    </div>
  );
}
export function HisabSkeleton() {
  return (
    <div className="space-y-4">
      <StatCardsSkeleton count={2} />
      <CardListSkeleton />
    </div>
  );
}
export function ChartSkeleton({ height = 260 }: { height?: number }) {
  return (
    <div
      className="skeleton-shimmer h-full w-full rounded-md"
      style={{ height }}
    />
  );
}
export function GridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
      {Array.from({ length: count }, (_, i) => (
        <Block key={i} className="aspect-square" />
      ))}
    </div>
  );
}
export function DelayedSkeleton({ children }: { children: React.ReactNode }) {
  return (
    <div role="status" aria-label="Loading">
      {children}
    </div>
  );
}
