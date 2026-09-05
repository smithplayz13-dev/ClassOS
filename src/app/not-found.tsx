import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <main className="error-page">
      <span className="eyebrow">404</span>
      <h1>This page isn&apos;t on the timetable.</h1>
      <Link className="button primary" href="/">
        <ArrowLeft size={16} />
        Back to dashboard
      </Link>
    </main>
  );
}
