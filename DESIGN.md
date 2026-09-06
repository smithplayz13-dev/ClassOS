# ClassOS interface system

The active design uses porcelain surfaces, ink text, and cobalt accents. The user explicitly requested replacing the green theme. Geist is the typeface, with restrained weights, negative tracking on display headings, and tabular numbers for schedules and metrics.

## Tokens

- Canvas: `#f7f7f5`; navigation: `#efefec`; panels: `#ffffff`.
- Text: `#242631`; secondary text: `#656976`.
- Primary action and focus: `#3456d8`; hover: `#2343b6`.
- Accent surface: `#edf0fc`; border: `#e0e1e5`.
- Warning: amber with explanatory text. Errors: `#b33342` with inline feedback.
- Subject colors are course identifiers from existing workspace data, separate from the brand palette.

## Layout and behavior

`src/app/revamp.css` is the active visual layer over the structural and workflow styles. The older `taste.css` is not imported.

Desktop uses a persistent sidebar, contextual breadcrumb, and a restrained content width. Dashboard panels fill a dense 12-column grid (7 + 5), with four equal summary cells. Mobile uses a full navigation drawer plus four persistent shortcuts. The timetable becomes a daily list on smaller screens. Forms, empty states, errors, dialogs, and offline screens share the same tokens.

The welcome page uses an editorial split, three-line heading, subject marquee with pause control, keyboard-operated feature accordion, and an anchored setup form. Working pages retain compact spacing appropriate to daily use. GSAP scale/fade and sequential text reveal are restricted to welcome media; normal interactions use CSS. Reduced-motion preferences disable decorative animation.

## Interaction reference

Use [Vercel Web Interface Guidelines](https://vercel.com/design/guidelines) for keyboard operation, visible focus, URL-backed navigation and filters, native dialogs, responsive targets, labeled inputs, readable states, and deliberate motion. Keep navigation as links and preserve standard browser behavior. Never hide important content behind animation.

The page finder supports Ctrl+K / Command+K, native Escape dismissal, search, and standard link navigation. Input text stays 16px on mobile. Dialog padding does not act as a backdrop dismissal target. Keep fixed mobile navigation clear of final content and device safe areas.

## Assets and validation

The decorative canoe photograph is stored at `public/images/study-landscape.jpg`, sourced from `https://picsum.photos/seed/classos-study/1920/1080`. It receives a grayscale treatment and a dark blue overlay. No external image request is needed at runtime.

`node scripts/check-ui-revamp.mjs` checks eight routes at 1440, 1024, 390, and 320px, saves previews under `.artifacts/ui-revamp`, and exercises navigation, dialogs, the accordion, and reduced motion. Existing Playwright tests run against a separate test database; do not reset a personal or demo workspace for screenshots.
