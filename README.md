# ClassOS

**Your school schedule adapts when real life interrupts it.**

ClassOS is an adaptive school productivity MVP: a dark, responsive student workspace with relational persistence, missed-work extraction and human review, explainable multi-day planning, and an installable PWA shell. It runs locally without an AI key.

## Run locally

Use Node.js 24 LTS and npm. Node.js 22.12+ is also supported by the application dependencies. Run commands from the repository root.

```sh
npm ci
```

Create the local environment file:

```powershell
# PowerShell
Copy-Item .env.example .env
```

```sh
# macOS / Linux
cp .env.example .env
```

Then initialise the database and start the application:

```sh
npm run db:setup
npm run dev
```

Open [ClassOS](http://127.0.0.1:3000). For an occupied port, use `npm run dev -- --port 3001`.

The seed creates one student, six subjects, 25 recurring lessons, 11 tasks, two tests, one absence, one missed-work source, and 11 study sessions. Dates are relative to the first seed run in the student's timezone. Re-running the seed preserves the existing workspace and user edits; it does not roll deadlines forward or reset data.

## Implemented workflows

- Dashboard: database-derived priorities, study sessions, workload, upcoming tests, and catch-up progress.
- Timetable: add, edit, and delete recurring classes across seven days, with overlap validation.
- Assignments: create, edit, delete, filter, complete and reopen tasks; create and edit tests with linked preparation tasks.
- Planner: review and apply an explained 14-day proposal; move, lock, unlock, skip, or log study sessions.
- Catch Up: record absences, paste notes or upload PDF/PNG/JPEG/TXT/Markdown files, edit extracted suggestions, accept selected tasks, and track recovery.
- Progress: completed tasks, recorded study time, and subject-level completion.
- Settings: validated name, timezone, study start time, daily limit, study-block length, and breaks.
- PWA: install manifest, app icons, install prompt where supported, connection status, and a privacy-preserving offline fallback.

Workload changes automatically produce a revised proposal. Applying it is an explicit review step: fixed sessions survive, while unlocked future work is redistributed around classes, absences, daily capacity, and breaks. Revision-bound approval prevents an outdated proposal overwriting changed work. Completing a task does not claim that study minutes were spent; logging a study session records those minutes separately. No focus timer is included.

## Stack

Next.js 16 App Router, React 19, strict TypeScript, Tailwind CSS 4 with shared CSS design tokens, self-hosted Geist typography, Lucide icons, Prisma 7, local SQLite through `@prisma/adapter-better-sqlite3`, and Zod 4. Native HTML dialogs provide modal focus containment and Escape handling. GSAP and ScrollTrigger are split into an idle-loaded enhancement so the complete server-rendered interface remains usable before motion loads. A generated PNG app icon keeps the visual shell free of remote asset dependencies.

Vitest covers pure domain logic; Playwright runs against the production build. `package-lock.json` is included for reproducible versions. TypeScript 6 and ESLint 9 are selected for compatibility with Next.js's current lint plugins. Narrow overrides update `deepmerge-ts` and `mysql2` in Prisma's CLI dependency tree to patched versions; migrations, seeding, and build checks exercise those overrides. npm's `allowScripts` lists only the installed native/build dependencies that require lifecycle scripts.

## Architecture

| Location               | Responsibility                                                               |
| ---------------------- | ---------------------------------------------------------------------------- |
| `src/app/(workspace)/` | Server-rendered routes and shared application shell                          |
| `src/components/`      | Navigation, forms, task/session lists, chart and shared presentation         |
| `src/lib/domain/`      | Calendar dates, validation, urgency, priority and day-level planning         |
| `src/lib/db/`          | Database adapter, shared URL resolution, request-cached workspace repository |
| `src/lib/actions.ts`   | Validated server actions, workspace scoping and revalidation                 |
| `src/lib/ai/`          | Server-only provider selection and deterministic development parser          |
| `prisma/`              | Relational schema, versioned migration and idempotent central seed           |
| `tests/`               | Unit and isolated browser tests                                              |

Presentation reads the repository instead of maintaining page-specific mock arrays. Database access and provider selection are marked server-only. Client components receive only their required fields. The generated Prisma client provides reusable database model and enum types; pure domain helpers accept small independent contracts.

## Data model

`Student` owns `Subject`, `AcademicTask`, `Test`, `Absence`, and `StudySession` records. Subjects have `TimetableEntry` records and relate to tasks/tests. An absence contains `MissedWorkSource` records; extracted tasks can link back to a source. Sessions belong to a task and student. Indexes support status/date lookups, and one absence per student/calendar date is enforced by a unique constraint.

Calendar dates use validated `YYYY-MM-DD` strings; wall-clock times use `HH:mm`. Only true instants such as task creation/completion use `DateTime`. Today's date is calculated from the student's IANA timezone, avoiding UTC-midnight and daylight-saving shifts. Live priority is derived at read time; the stored priority field is an initial snapshot for future scheduling workflows.

`rebalance` is the active deterministic multi-day engine. It splits remaining effort into blocks, accounts for completed and locked study time, respects classes and recorded absences, includes breaks, and warns about deadlines or work that cannot fit. `planDay` remains a separately tested day-level primitive. Recommendations and arithmetic never require an LLM.

To move to PostgreSQL, change the Prisma datasource provider and adapter factory, add the PostgreSQL adapter, create a PostgreSQL migration baseline, and explicitly transfer existing data. The application-facing repository and domain contracts need not change; SQLite migration SQL is not portable to PostgreSQL.

## Environment

| Variable       | Default/example            | Purpose                                                             |
| -------------- | -------------------------- | ------------------------------------------------------------------- |
| `DATABASE_URL` | `file:./prisma/classos.db` | SQLite file, resolved from the project root by both CLI and runtime |
| `AI_PROVIDER`  | `deterministic`            | Selects the local development provider                              |

No external API key is required. The deterministic provider splits explicit text lines into review-required suggestions with a fixed 30-minute estimate; it does not infer subjects or deadlines and does not claim AI understanding. Every suggestion is editable before acceptance. Duplicate content is cached per absence and provider; simultaneous duplicate extraction requests share work within the server process.

Optional AI: set `AI_PROVIDER="openai"`, `OPENAI_API_KEY`, and optionally `OPENAI_MODEL` (default `gpt-5.4-mini`) in the server environment. The provider uses the [Responses API with strict structured output](https://developers.openai.com/api/docs/guides/structured-outputs), a 20-second timeout, output validation, and `store: false`. This sends extracted lesson text to OpenAI; leave deterministic mode enabled for local-only processing. The upload form can force local extraction for an individual request. Never put keys in `NEXT_PUBLIC_*` variables. Provider contract tests use stubs; a paid live API request has not been made.

Uploads are limited to 5 MB, PDFs to 20 pages, extracted text to 20,000 characters, and suggestions to 20. File extensions and signatures are checked. PDF parsing and English OCR run in isolated child processes, with two concurrent files, a 45-second deadline, and a 256 MB JavaScript heap limit. Original files are not retained; extracted text and reviewed data stay in SQLite. Scanned PDFs require page-image uploads or pasted text. Deployments must retain `scripts/extract-upload.mjs`, installed dependencies, and permission to spawn Node processes; edge runtimes are unsupported.

This is a **single-user local MVP**, bound to loopback by default. `DEMO_STUDENT_ID` is a deliberate identity boundary, not authentication. Before public hosting or use with real student records, add authenticated identity, per-user storage and access checks, rate limiting, backups, and an appropriate persistence/deployment strategy. No public deployment is included. Offline mode never caches private workspace pages or queues mutations; it clearly reports the disconnected state instead of pretending to save.

## Commands

```sh
npm run dev             # Local development
npm run build           # Generate Prisma client and build production app
npm start               # Serve production build on loopback
npm run lint            # ESLint
npm run typecheck       # Generate route/client types and run strict TypeScript
npm test                # Domain/provider/validation tests
npm run test:watch      # Unit tests in watch mode
npm run format          # Format authored files
npm run format:check    # Check formatting
npm run db:setup        # Generate client, apply migrations, seed if absent
npm run db:migrate -- --name change_name
npm run db:seed
```

Browser verification:

```sh
npx playwright install chromium
npm run build
npm run test:e2e
```

Playwright creates and resets only `.artifacts/e2e.db`, seeds it, and starts its own production server on port 3107. It does not write to the normal demo database. Tests cover all seven routes at desktop/mobile sizes, document overflow, persisted edits, absence duplicates, review-before-creation, schedule approval, locked sessions, study logging, actual PDF/image extraction, test preparation, preferences, navigation, and offline fallback. Screenshots are written to `.artifacts/`; failure traces are retained in `test-results/`.

Run `node scripts/audit.mjs` after a build for a local mobile Lighthouse audit on port 3108. Reports are written to `.artifacts/lighthouse-dashboard.{json,html}`. See [PRD coverage and verification](docs/verification.md) for implementation boundaries and measured results. Local scores are not field performance guarantees; real INP needs interaction and deployment measurements.

The GitHub Actions workflow runs installation, database setup, lint, typecheck, unit tests, formatting, production build, and browser tests on Node.js 24.
