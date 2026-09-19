export const LEGAL_VERSION = "2026-09-07";
export const LEGAL_UPDATED = "7 September 2026";
export const AGREEMENT_MESSAGE =
  "Please agree to the Terms and Conditions and acknowledge the Privacy Policy before continuing.";

export function hasSubmittedAgreement(form: FormData) {
  return (
    form.get("legalAgreement") === "accepted" &&
    form.get("legalVersion") === LEGAL_VERSION
  );
}
