# ClassOS PRD implementation

The supplied Product Requirements Document is the product reference. Its embedded agent-oriented statements do not override workspace or safety instructions.

| PRD area               | Implementation                                                                                                                                                        |
| ---------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| What should I do now?  | Shared deterministic urgency/importance scoring, next priorities, deadline explanations, daily sessions                                                               |
| Missed school recovery | Absence -> notes/file -> extraction -> editable human review -> catch-up tasks -> adapted plan                                                                        |
| Schedule adaptation    | 14-day deterministic engine; capacity, breaks, classes, absences, completed effort, locked blocks; explicit explanations and revision-checked approval                |
| Functional workspace   | Seven routes, task/test/class editors, completion, session movement/locking/skipping/logging, persisted preferences                                                   |
| Motion                 | CSS interaction feedback plus idle-loaded GSAP scroll reveals/pinning, optimistic checkboxes, loading feedback, and reduced-motion overrides                          |
| Performance            | Server-rendered pages; profile-only shell query; request-cached repository; narrow route revalidation; source text excluded from other routes; deferred motion bundle |
| AI discipline          | Local default, optional validated structured provider, no AI for arithmetic, request timeout, duplicate cache and concurrent coalescing                               |
| Upload responsiveness  | Validated bounded inputs, isolated native parsing/OCR child processes, concurrency and timeout limits                                                                 |
| PWA                    | Manifest, icons, install prompt, service worker and explicit offline fallback without private data caching                                                            |
| Quality                | Unit tests, production browser tests, mobile/desktop screenshots, strict types, lint, formatting, Lighthouse                                                          |

## Scope boundaries

- The MVP is a single local student workspace, not an authenticated multi-tenant service. Public deployment requires identity, persistence operations, security hardening, and consent/data-retention decisions.
- Offline mode is an honest fallback, not offline editing or cross-device sync.
- English OCR handles images; scanned PDFs should be submitted as page images. Extraction is limited to 20 suggestions per upload and requires review.
- Optional OpenAI behavior is contract-tested with stubs. No live paid request was made without credentials.
- Subject seed data is editable through database administration; there is no subject-management screen or calendar integration.
- Lists suit the seeded/student-scale workload. A large institutional dataset requires query-level pagination and database aggregation; no large-scale benchmark is claimed.
- Schedule adaptation computes proposals automatically but requires approval before rearranging unlocked blocks.

## Verification

Automated tests run against a fresh isolated SQLite database. Browser tests include genuine generated PDF and PNG fixtures rather than mocking extraction. See README for reproducible commands.

The final mobile Lighthouse audit on the local production dashboard measured Performance 96, Accessibility 100, Best Practices 100, LCP 2.7 seconds, CLS 0, and TBT 70 ms. The local LCP is close to, but does not yet meet, the PRD's aspirational sub-2.5-second target. These are lab measurements on this machine, not measured field INP. The reports in `.artifacts/` are authoritative for this run.
