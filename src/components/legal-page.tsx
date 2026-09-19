import Link from "next/link";
import { ArrowLeft, Command, FileText, ShieldCheck } from "lucide-react";
import { LEGAL_UPDATED, LEGAL_VERSION } from "@/lib/legal";
import { LegalLinks } from "./legal-consent";
import type { ReactNode } from "react";

export function LegalPage({
  kind,
  intro,
  sections,
}: {
  kind: "terms" | "privacy";
  intro: string;
  sections: { id: string; title: string; content: ReactNode }[];
}) {
  const title = kind === "terms" ? "Terms and Conditions" : "Privacy Policy";
  const Icon = kind === "terms" ? FileText : ShieldCheck;
  return (
    <div className="legal-shell">
      <a href="#legal-content" className="skip-link">
        Skip to policy
      </a>
      <header className="welcome-nav">
        <Link href="/" className="brand" aria-label="ClassOS home">
          <span className="brand-mark">
            <Command size={22} />
          </span>
          <span translate="no">ClassOS</span>
        </Link>
        <Link href="/#setup" className="text-link">
          <ArrowLeft size={15} />
          Back to sign in
        </Link>
      </header>
      <main id="legal-content" tabIndex={-1} className="legal-main">
        <div className="legal-heading">
          <Icon size={26} aria-hidden="true" />
          <h1>{title}</h1>
          <p>{intro}</p>
          <span>
            Last updated {LEGAL_UPDATED} · Version {LEGAL_VERSION}
          </span>
        </div>
        <div className="legal-layout">
          <nav className="legal-contents" aria-label="On this page">
            <strong>On this page</strong>
            {sections.map((section) => (
              <a href={`#${section.id}`} key={section.id}>
                {section.title}
              </a>
            ))}
          </nav>
          <article className="legal-document" aria-label={title}>
            {sections.map((section) => (
              <section key={section.id} id={section.id}>
                <h2>{section.title}</h2>
                {section.content}
              </section>
            ))}
            <Link href="/#setup" className="button primary">
              Return to sign in
            </Link>
          </article>
        </div>
      </main>
      <footer className="welcome-footer">
        <span translate="no">ClassOS</span>
        <LegalLinks />
        <span>One day at a time.</span>
      </footer>
    </div>
  );
}

export function PrivacyContact() {
  const email = process.env.CLASSOS_PRIVACY_EMAIL;
  return (
    <p>
      ClassOS is the operator identified for this installation.{" "}
      {email ? (
        <>
          For privacy questions or requests, contact{" "}
          <a href={`mailto:${email}`}>{email}</a>.
        </>
      ) : (
        <>
          A dedicated contact email has not yet been published. Contact the
          person who provided or administers your ClassOS installation for
          privacy questions or requests.
        </>
      )}
    </p>
  );
}
