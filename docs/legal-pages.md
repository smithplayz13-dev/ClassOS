# Legal pages and workspace agreement

The public routes `/terms` and `/privacy` describe the current local ClassOS installation. ClassOS is the operator name. Set the optional `CLASSOS_PRIVACY_EMAIL` environment variable and rebuild to publish a contact email; until then, the notice directs users to their installation administrator. These pages are written for the current implementation, not a claim of compliance for a future hosted service or a particular jurisdiction.

Personal setup, returning-user entry, and switching to a personal workspace each require an unchecked agreement checkbox. The sample demo workspace can be opened without agreement. Privacy is acknowledged as a notice, rather than treated as blanket consent to unrelated processing. Links open in another tab to preserve entered form values.

Server actions validate the submitted agreement and current `LEGAL_VERSION` before personal workspace entry. Successful personal entry stores the policy version, acceptance time, workspace ID, and a hash of a random browser token in `LegalAcceptance`. The HTTP-only browser cookie expires after one year. Raw tokens are not stored in the database. Personal workspace access validates the record, version, workspace, and age. This is an agreement gate for personal local workspaces; it does not introduce account authentication.

Apply the additive migration with `prisma migrate deploy` and regenerate the Prisma client. Existing coursework is preserved. Existing browsers must agree before entering after this feature is installed. Deleting or resetting a workspace also removes its acceptance records; users then agree again.

When either policy changes substantively, update both `LEGAL_VERSION` and `LEGAL_UPDATED` in `src/lib/legal.ts` together with the policy text. Old records no longer grant workspace access. Keep policy revisions in version control so accepted versions can be identified.

Tests in `tests/e2e/legal.spec.ts` cover public access and mobile layout, agreement-free demo entry, unchecked and required personal controls, server-side bypass rejection, signup rejection without agreement, policy links preserving input, persisted acceptance, version changes, and cleared cookies.
