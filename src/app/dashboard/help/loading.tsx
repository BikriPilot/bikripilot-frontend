export default function Loading() {
  return (
    <div className="animate-pulse space-y-6">
      <div className="h-10 w-48 rounded bg-muted" />
      <div className="grid gap-4 md:grid-cols-2">
        {[1, 2, 3, 4].map((item) => (
          <div key={item} className="h-36 rounded-xl bg-muted" />
        ))}
      </div>
    </div>
  );
}
