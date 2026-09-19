import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  CalendarCheck2,
  Check,
  ChevronRight,
  Clock3,
  Command,
  FileText,
  ListChecks,
  NotebookPen,
} from "lucide-react";
import { db } from "@/lib/db";
import { PERSONAL_STUDENT_ID, DEMO_STUDENT_ID } from "@/lib/db/workspace";
import { switchWorkspace } from "@/lib/personal-actions";
import { PersonalSetup } from "@/components/personal-setup";
import { LegalConsent, LegalLinks } from "@/components/legal-consent";
import { AGREEMENT_MESSAGE } from "@/lib/legal";
import { LandingMotion } from "./landing-motion";
import { LandingNav } from "./landing-nav";
import { ProductTour } from "./product-tour";
import { LandingFaq } from "./landing-faq";
import styles from "./landing.module.css";

export async function LandingPage({
  searchParams,
}: {
  searchParams: Promise<{ agreement?: string }>;
}) {
  const { agreement } = await searchParams;
  const profiles = await db.student.findMany({
    where: { id: { in: [PERSONAL_STUDENT_ID, DEMO_STUDENT_ID] } },
    select: { id: true, name: true },
  });
  const personal = profiles.find(
    (student) => student.id === PERSONAL_STUDENT_ID,
  );

  return (
    <LandingMotion>
      <a className="skip-link" href="#setup">
        Skip to setup
      </a>
      <LandingNav />
      <main>
        <section
          id="overview"
          className={styles.hero}
          aria-labelledby="landing-title"
        >
          <div className={styles.heroCopy}>
            <p className={styles.heroEyebrow} data-hero-copy>
              A little less chaos. A little more ClassOS.
            </p>
            <h1 id="landing-title" data-hero-copy>
              School, sorted.
              <br />
              <span>Life, in balance.</span>
            </h1>
            <p className={styles.heroDescription} data-hero-copy>
              Your classes, deadlines, and study time. Together at last,
              <br className={styles.desktopBreak} /> with room for everything
              else.
            </p>
            <div className={styles.heroActions} data-hero-copy>
              <a className={styles.primaryButton} href="#setup">
                Make it yours <ArrowRight size={16} aria-hidden="true" />
              </a>
              <a className={styles.blueLink} href="#features-title">
                Explore ClassOS <ChevronRight size={17} aria-hidden="true" />
              </a>
            </div>
          </div>
          <div className={styles.heroProduct} data-product-hero>
            <div className={styles.productFrame}>
              <Image
                src="/images/landing/dashboard.webp"
                alt="ClassOS dashboard with sample coursework, a clear next priority, and a study plan with room to breathe."
                width={1440}
                height={940}
                sizes="(max-width: 734px) 96vw, (max-width: 1068px) 90vw, 1060px"
                loading="eager"
                fetchPriority="high"
              />
            </div>
            <p className={styles.heroCaption}>
              Your whole school day. One thoughtful workspace.
            </p>
          </div>
        </section>

        <section
          className={styles.subjects}
          aria-label="A workspace for every subject"
        >
          <p>Whatever&apos;s on your timetable.</p>
          <ul>
            {[
              "Mathematics",
              "Literature",
              "Physics",
              "History",
              "Art",
              "Chemistry",
            ].map((subject) => (
              <li key={subject}>{subject}</li>
            ))}
          </ul>
        </section>

        <section className={styles.explore} aria-labelledby="features-title">
          <div className={styles.sectionHeading} data-reveal>
            <p className={styles.sectionLabel}>Everything, in its place.</p>
            <h2 id="features-title">
              A clearer view.
              <br />
              <span>A calmer day.</span>
            </h2>
          </div>
          <div data-reveal>
            <ProductTour />
          </div>
        </section>

        <section
          className={styles.featurePair}
          aria-label="Built around real life"
        >
          <article className={styles.catchupTile} data-reveal>
            <div className={styles.tileCopy}>
              <span className={styles.featureIcon}>
                <NotebookPen size={25} strokeWidth={1.5} aria-hidden="true" />
              </span>
              <h2>
                Miss a day.
                <br />
                Keep your momentum.
              </h2>
              <p>
                Life happens. Turn missed lessons into a manageable plan, one
                small step at a time.
              </p>
              <Link className={styles.blueLink} href="/catch-up">
                Explore catch-up <ChevronRight size={16} aria-hidden="true" />
              </Link>
            </div>
            <ol className={styles.recoveryFlow} aria-label="How catch-up works">
              <li>
                <span className={styles.flowIcon}>
                  <FileText size={22} strokeWidth={1.5} aria-hidden="true" />
                </span>
                <div>
                  <strong>Bring your notes</strong>
                  <p>Text, photos, or a PDF.</p>
                </div>
                <Check size={17} aria-hidden="true" />
              </li>
              <li>
                <span className={styles.flowIcon}>
                  <ListChecks size={22} strokeWidth={1.5} aria-hidden="true" />
                </span>
                <div>
                  <strong>Review what matters</strong>
                  <p>Make the extracted tasks your own.</p>
                </div>
                <Check size={17} aria-hidden="true" />
              </li>
              <li>
                <span className={styles.flowIcon}>
                  <CalendarCheck2
                    size={22}
                    strokeWidth={1.5}
                    aria-hidden="true"
                  />
                </span>
                <div>
                  <strong>Make room in your week</strong>
                  <p>A catch-up plan at your pace.</p>
                </div>
                <ArrowRight size={17} aria-hidden="true" />
              </li>
            </ol>
          </article>
          <article className={styles.lifeTile} data-reveal>
            <div className={styles.tileCopy}>
              <span className={styles.featureIcon}>
                <Clock3 size={25} strokeWidth={1.5} aria-hidden="true" />
              </span>
              <h2>
                Made for school.
                <br />
                With room for life.
              </h2>
              <p>
                Set your study hours. Protect your breaks. Make a little more
                space for being you.
              </p>
              <a className={styles.blueLink} href="#setup">
                Make it yours <ChevronRight size={16} aria-hidden="true" />
              </a>
            </div>
            <Image
              className={styles.lifeImage}
              src="/images/landing/room-for-life.webp"
              alt="A notebook, headphones, and a blue backpack on a sunlit campus lawn."
              width={1536}
              height={1024}
              sizes="(max-width: 734px) 100vw, 50vw"
            />
          </article>
        </section>

        <section
          id="how-it-works"
          className={styles.howItWorks}
          aria-labelledby="how-title"
        >
          <div className={styles.sectionHeading} data-reveal>
            <h2 id="how-title">
              Your rhythm.
              <br />
              <span>Right from the start.</span>
            </h2>
            <p>A few small details. A workspace that feels like you.</p>
          </div>
          <div className={styles.steps}>
            <article data-reveal>
              <BookOpen size={29} strokeWidth={1.4} aria-hidden="true" />
              <h3>Bring your subjects.</h3>
              <p>
                Give your classes, assignments, and upcoming tests one place to
                call home.
              </p>
            </article>
            <article data-reveal>
              <Clock3 size={29} strokeWidth={1.4} aria-hidden="true" />
              <h3>Make time your own.</h3>
              <p>
                Choose when you study, how long you focus, and when you need a
                breather.
              </p>
            </article>
            <article data-reveal>
              <CalendarCheck2 size={29} strokeWidth={1.4} aria-hidden="true" />
              <h3>Take the next step.</h3>
              <p>
                Start with a clear priority. Review your plan as your school
                week changes.
              </p>
            </article>
          </div>
        </section>

        <section className={styles.faq} aria-labelledby="faq-title" data-reveal>
          <div>
            <h2 id="faq-title">
              A few things
              <br />
              to know.
            </h2>
            <p>Before you make yourself at home.</p>
          </div>
          <LandingFaq />
        </section>

        <section
          id="setup"
          tabIndex={-1}
          className={styles.setup}
          aria-labelledby="setup-title"
        >
          <div className={styles.setupInner}>
            <div className={styles.setupIntro} data-reveal>
              <span className={styles.setupMark}>
                <Command size={31} strokeWidth={1.5} aria-hidden="true" />
              </span>
              <h2 id="setup-title">
                A fresh start.
                <br />
                <span>Made for you.</span>
              </h2>
              <p>
                Start with your subjects and study availability. You can adjust
                everything as you go.
              </p>
              <div className={styles.setupNote}>
                <Check size={17} aria-hidden="true" />
                <span>Your subjects. Your pace. Your workspace.</span>
              </div>
            </div>
            <div className={styles.setupPanel}>
              <div className={styles.formHeading}>
                <h3>{personal ? "Welcome back." : "Make yourself at home."}</h3>
                <p>
                  {personal
                    ? "Your workspace is ready when you are."
                    : "Let’s make your school day feel a little lighter."}
                </p>
              </div>
              {agreement === "required" && (
                <p className="legal-notice" role="alert">
                  {AGREEMENT_MESSAGE}
                </p>
              )}
              {personal ? (
                <form action={switchWorkspace}>
                  <input type="hidden" name="mode" value="personal" />
                  <LegalConsent />
                  <button className="button primary">
                    <ArrowRight size={16} aria-hidden="true" />
                    Continue as {personal.name}
                  </button>
                </form>
              ) : (
                <PersonalSetup />
              )}
              {profiles.some((student) => student.id === DEMO_STUDENT_ID) && (
                <form action={switchWorkspace} className={styles.demoForm}>
                  <div>
                    <strong>Just looking around?</strong>
                    <p>Take a look with sample coursework.</p>
                  </div>
                  <input type="hidden" name="mode" value="demo" />
                  <button className={styles.demoButton}>
                    Open demo workspace{" "}
                    <ArrowUpRight size={16} aria-hidden="true" />
                  </button>
                </form>
              )}
            </div>
          </div>
        </section>
      </main>
      <footer className={styles.footer}>
        <div className={styles.footerTop}>
          <Link className={styles.brand} href="/" aria-label="ClassOS home">
            <Command size={22} strokeWidth={1.7} aria-hidden="true" />
            <span translate="no">ClassOS</span>
          </Link>
          <span>One day at a time.</span>
          <a className={styles.blueLink} href="#overview">
            Back to the top <ArrowUpRight size={15} aria-hidden="true" />
          </a>
        </div>
        <div className={styles.footerBottom}>
          <span>A little more room for what matters.</span>
          <LegalLinks />
          <Link href="/dashboard">
            Open workspace <ArrowUpRight size={13} aria-hidden="true" />
          </Link>
        </div>
      </footer>
    </LandingMotion>
  );
}
