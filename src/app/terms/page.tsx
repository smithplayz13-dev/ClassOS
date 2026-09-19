import type { Metadata } from "next";
import Link from "next/link";
import { LegalPage, PrivacyContact } from "@/components/legal-page";

export const metadata: Metadata = { title: "Terms and Conditions" };

export default function TermsPage() {
  return (
    <LegalPage
      kind="terms"
      intro="The ground rules for using ClassOS to organize your schoolwork."
      sections={[
        {
          id: "agreement",
          title: "Your agreement",
          content: (
            <p>
              These terms apply to the current local version of ClassOS. By
              checking the agreement box and entering a personal workspace, you
              agree to these terms and acknowledge the{" "}
              <Link href="/privacy">Privacy Policy</Link>. If you do not agree,
              do not enter or use a personal workspace. You can read both
              policies and explore the sample demo without accepting them.
            </p>
          ),
        },
        {
          id: "service",
          title: "What ClassOS provides",
          content: (
            <>
              <p>
                ClassOS helps organize subjects, classes, assignments, tests,
                study sessions, and missed work. Plans and extracted tasks are
                suggestions that you must review. ClassOS does not submit
                schoolwork, verify school requirements, or guarantee grades,
                deadlines, or learning outcomes.
              </p>
              <p>
                This version runs as a local installation and uses workspace
                selection rather than password-based accounts. Anyone with
                access to the installation and its browser may be able to enter
                its workspaces. It is intended to be kept on a trusted local
                device.
              </p>
            </>
          ),
        },
        {
          id: "eligibility",
          title: "Who may use it",
          content: (
            <p>
              Use ClassOS only if you can enter into this agreement under the
              rules that apply to you, or with any required permission and
              supervision from a parent, guardian, or authorized school
              representative. Follow your school’s rules for learning tools,
              uploaded materials, and academic integrity.
            </p>
          ),
        },
        {
          id: "responsibilities",
          title: "Your responsibilities",
          content: (
            <ul>
              <li>
                Keep your schedule, assignments, and deadlines accurate and
                check them against your school’s instructions.
              </li>
              <li>
                Protect the device and any backups that hold your workspace.
              </li>
              <li>
                Only add materials you own or have permission to use. Avoid
                unnecessary personal information about others.
              </li>
              <li>
                Do not use ClassOS unlawfully, disrupt the installation, or
                attempt to access data you are not entitled to use.
              </li>
            </ul>
          ),
        },
        {
          id: "content",
          title: "Your content and AI suggestions",
          content: (
            <>
              <p>
                You retain your rights to the content you add. You permit
                ClassOS to store and process it to provide the features you use.
                This permission does not transfer ownership of your schoolwork.
              </p>
              <p>
                Automatic extraction may omit information or make mistakes.
                Review and correct suggested tasks before accepting them. If an
                administrator enables an external AI provider, submitted lesson
                text may be sent to that provider as explained in the Privacy
                Policy.
              </p>
            </>
          ),
        },
        {
          id: "availability",
          title: "Availability and limitations",
          content: (
            <>
              <p>
                ClassOS is provided on an “as available” basis. Features may
                change or become unavailable. Keep independent copies of
                important schoolwork; the local installation does not provide a
                managed backup service.
              </p>
              <p>
                To the extent permitted by applicable law, ClassOS does not
                promise uninterrupted or error-free operation and is not
                responsible for losses caused by reliance on an unverified plan
                or suggestion. Nothing in these terms excludes liability or
                rights that cannot legally be excluded.
              </p>
            </>
          ),
        },
        {
          id: "leaving",
          title: "Stopping use",
          content: (
            <p>
              You can stop using ClassOS at any time. Clearing browser cookies
              removes the browser’s remembered agreement and workspace
              selection, but does not delete the stored workspace. Contact the
              installation administrator about removing stored data and backups.
              The Privacy Policy explains the available data controls.
            </p>
          ),
        },
        {
          id: "changes",
          title: "Changes to these terms",
          content: (
            <p>
              The date and version above identify these terms and the related
              privacy notice. When a new policy version is released, ClassOS
              requires a fresh agreement before personal workspace access. You
              can review the current text through the links in the workspace
              footer.
            </p>
          ),
        },
        {
          id: "contact",
          title: "Contact ClassOS",
          content: <PrivacyContact />,
        },
      ]}
    />
  );
}
