const SkeletonCard = () => (
  <div className="overflow-hidden rounded-xl border border-border bg-card">
    <div className="aspect-[4/3] animate-pulse-subtle bg-muted" />
    <div className="space-y-3 p-4">
      <div className="flex justify-between">
        <div className="h-4 w-2/3 animate-pulse-subtle rounded bg-muted" />
        <div className="h-5 w-16 animate-pulse-subtle rounded bg-muted" />
      </div>
      <div className="h-3 w-1/2 animate-pulse-subtle rounded bg-muted" />
      <div className="flex justify-between">
        <div className="h-3 w-20 animate-pulse-subtle rounded bg-muted" />
        <div className="h-7 w-16 animate-pulse-subtle rounded bg-muted" />
      </div>
    </div>
  </div>
);

export default SkeletonCard;
