import Link from "next/link";
import { LEGAL_VERSION } from "@/lib/legal";

export function LegalConsent() {
  return (
    <div className="legal-consent">
      <input type="hidden" name="legalVersion" value={LEGAL_VERSION} />
      <label className="legal-checkbox">
        <input
          type="checkbox"
          name="legalAgreement"
          value="accepted"
          required
        />
        <span>
          I agree to the Terms and Conditions and acknowledge the Privacy
          Policy.
        </span>
      </label>
      <div className="legal-consent-links">
        <Link href="/terms" target="_blank" rel="noopener noreferrer">
          Read Terms and Conditions{" "}
          <span className="sr-only">(opens in a new tab)</span>
        </Link>
        <Link href="/privacy" target="_blank" rel="noopener noreferrer">
          Read Privacy Policy{" "}
          <span className="sr-only">(opens in a new tab)</span>
        </Link>
      </div>
    </div>
  );
}

export function LegalLinks() {
  return (
    <nav className="legal-links" aria-label="Legal">
      <Link href="/terms">Terms and Conditions</Link>
      <Link href="/privacy">Privacy Policy</Link>
    </nav>
  );
}
