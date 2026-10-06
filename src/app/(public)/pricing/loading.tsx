export default function Loading() {
  return (
    <div className="mx-auto max-w-7xl animate-pulse px-5 py-16 sm:px-8">
      <div className="h-10 w-64 rounded bg-muted" />
      <div className="mt-10 grid gap-4 lg:grid-cols-3">
        {[1, 2, 3].map((item) => (
          <div key={item} className="h-96 rounded-2xl bg-muted" />
        ))}
      </div>
    </div>
  );
}
