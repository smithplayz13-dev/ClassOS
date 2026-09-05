export default function Loading() {
  return (
    <div className="loading-state" role="status" aria-label="Loading workspace">
      <div className="skeleton skeleton-title" />
      <div className="skeleton skeleton-banner" />
      <div className="skeleton skeleton-content" />
      <span className="sr-only">Loading your workspace...</span>
    </div>
  );
}
