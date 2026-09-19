import type { Metadata } from "next";
import { LegalPage, PrivacyContact } from "@/components/legal-page";

export const metadata: Metadata = { title: "Privacy Policy" };

export default function PrivacyPage() {
  return (
    <LegalPage
      kind="privacy"
      intro="What this local installation stores, how it uses that information, and the choices you have."
      sections={[
        {
          id: "operator",
          title: "Who handles your information",
          content: (
            <>
              <PrivacyContact />
              <p>
                This notice describes the current ClassOS local installation. It
                does not describe a separate school system, a public hosting
                service, or an external AI provider’s own practices.
              </p>
            </>
          ),
        },
        {
          id: "information",
          title: "Information you provide",
          content: (
            <ul>
              <li>
                Your name, timezone, study availability, study limits, and break
                preferences.
              </li>
              <li>
                Subjects, teacher names and rooms you enter, classes,
                assignments, test details, deadlines, and task completion.
              </li>
              <li>
                Absence dates and notes, lesson text, uploaded filenames,
                extracted text, suggested tasks, and your review choices.
              </li>
              <li>
                Planned and completed study sessions, including durations and
                progress.
              </li>
              <li>
                For personal workspaces, the policy version and time of
                agreement, with a hashed random browser token used to recognize
                that agreement.
              </li>
            </ul>
          ),
        },
        {
          id: "purpose",
          title: "How information is used",
          content: (
            <p>
              ClassOS uses this information to display your workspace,
              prioritize schoolwork, create study plans, recover missed work,
              show progress, and remember your agreement to the current policies
              when you use a personal workspace. It does not need sensitive
              personal details to plan your study time. Avoid entering health
              details or other private information in absence notes unless
              necessary.
            </p>
          ),
        },
        {
          id: "storage",
          title: "Where information is stored",
          content: (
            <>
              <p>
                Workspace information and agreement records are stored in a
                database on the computer running ClassOS. If your browser
                connects to ClassOS on another computer, the information is
                stored on that computer, not necessarily on the device
                displaying the page. Installation administrators and people with
                access to that computer or its backups may be able to access it.
              </p>
              <p>
                Uploaded files are read for text extraction. The current upload
                flow retains the filename, extracted text, processing details,
                and suggestions in the database; it does not retain the original
                uploaded file as a workspace attachment.
              </p>
            </>
          ),
        },
        {
          id: "providers",
          title: "Local processing and external AI",
          content: (
            <>
              <p>
                Local extraction processes lesson text and document or image
                text on the installation computer. When an administrator
                configures OpenAI extraction and you use that provider, the
                lesson text or extracted text is sent to OpenAI to generate task
                suggestions. Your full workspace is not included in that
                extraction request.
              </p>
              <p>
                The app requests that OpenAI not store the response, but this is
                not a guarantee of zero retention by the provider. The
                provider’s own terms, privacy practices, and processing location
                apply. Choose local extraction in the lesson-notes workflow if
                you do not want that text sent to the configured AI service.
              </p>
            </>
          ),
        },
        {
          id: "browser",
          title: "Cookies and browser storage",
          content: (
            <>
              <p>
                The classos-workspace cookie remembers the selected workspace.
                For personal workspaces, the classos-legal cookie contains a
                random token that is matched to a stored agreement record. These
                cookies can last up to one year and are not readable by page
                scripts. A new policy version, expired agreement, or cleared
                cookies requires agreement again before personal workspace
                access.
              </p>
              <p>
                The installed-app feature caches an offline information page.
                The current app does not intentionally cache private workspace
                responses or replay changes made while offline. ClassOS does not
                include advertising cookies or analytics tracking in this
                version. Normal server and browser diagnostics may contain
                technical request information.
              </p>
            </>
          ),
        },
        {
          id: "retention",
          title: "Retention and deletion",
          content: (
            <>
              <p>
                Workspace data remains in the local database until removed using
                available controls or by the installation administrator. There
                is no automatic time-based deletion of workspace data or
                agreement records. Agreement records are deleted when their
                associated workspace is deleted. Copies in backups require
                separate removal.
              </p>
              <p>
                You can edit your profile, preferences, and coursework in the
                app. Some items cannot be deleted while related coursework still
                depends on them. For a complete copy, correction, or removal
                request, contact your installation administrator. Clearing
                cookies alone does not delete the database.
              </p>
            </>
          ),
        },
        {
          id: "choices",
          title: "Your choices and rights",
          content: (
            <p>
              You can decline the terms and stop before entering a personal
              workspace, explore the sample demo without agreeing, use local
              extraction, control the information you add, and clear the
              remembered browser agreement. Depending on the law that applies to
              you, you may also have rights to access, correct, delete,
              restrict, or obtain a copy of personal information, or raise a
              concern with a relevant privacy authority. Contact the
              installation administrator to discuss a request. Acknowledging
              this notice does not waive those rights or authorize unrelated
              uses of your data.
            </p>
          ),
        },
        {
          id: "students",
          title: "Student information",
          content: (
            <p>
              Students should use ClassOS with any permission or supervision
              required by their school and applicable law. Parents, guardians,
              and school representatives should review this notice before
              helping a student enter personal information. Avoid uploading
              other students’ information without appropriate permission.
            </p>
          ),
        },
        {
          id: "updates",
          title: "Updates to this notice",
          content: (
            <p>
              Updates are identified by the date and version at the top of this
              page. ClassOS requires acknowledgment of the current notice
              together with agreement to the terms when entering a personal
              workspace after a policy version changes. The sample demo remains
              available without agreement.
            </p>
          ),
        },
      ]}
    />
  );
}
