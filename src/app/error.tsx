"use client";

import { RotateCcw, TriangleAlert } from "lucide-react";

export default function ErrorPage({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="error-page">
      <TriangleAlert size={30} />
      <h1>We couldn&apos;t load your workspace.</h1>
      <p>Your changes haven&apos;t been lost. Please try again.</p>
      <button className="button primary" onClick={reset}>
        <RotateCcw size={16} />
        Try again
      </button>
    </main>
  );
}
