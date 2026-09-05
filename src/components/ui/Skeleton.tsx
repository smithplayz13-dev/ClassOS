export function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse bg-zinc-800/60 rounded-xl ${className}`} />;
}
export function CardSkeleton() {
  return (
    <div className="card rounded-[20px] p-5 space-y-3 animate-pulse">
      <div className="h-4 w-32 bg-zinc-800 rounded" />
      <div className="h-3 w-full bg-zinc-800 rounded" />
      <div className="h-20 bg-zinc-800 rounded-xl" />
    </div>
  );
}
