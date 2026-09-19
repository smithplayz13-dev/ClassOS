# ClassOS landing page

## Direction

The user-supplied `C:/Users/Smith/Downloads/DESIGN.md` is the visual reference:
white and #f5f5f7 canvases, charcoal product sections, #0066cc actions,
600-weight sans-serif display type, pill actions, minimal chrome, and a single
soft shadow beneath the hero product. The existing ClassOS Command mark,
routes, legal copy, form fields, and workspace actions are retained.

This is a visual overhaul. Design variance 7, motion intensity 5, density 3.
The supplied design's alternating light/dark product tiles take precedence
over generic skill defaults for automatic dark mode. The page intentionally
keeps this art direction under either system color preference.

The original landing page used a split hero with a landscape, three feature
cards, and setup. The new composition introduces the actual product before
setup, then a tabbed product tour, two feature tiles, setup guidance, FAQ,
and the original personal/demo workspace paths. Styling is isolated in a CSS
module; dashboard and onboarding styles are not changed.

## Origin UI

`src/components/landing/origin.tsx` adapts these official Origin UI sources:

- https://github.com/shadcn/originui/blob/main/registry/default/ui/tabs.tsx
- https://github.com/shadcn/originui/blob/main/registry/default/ui/accordion.tsx
- https://github.com/shadcn/originui/blob/main/LICENSE.md

The source-owned component structure and Radix keyboard/ARIA behavior are
preserved. Scoped CSS replaces registry utility classes, and individual Radix
packages replace the upstream umbrella import. The accordion uses a rotating
Plus icon. License text is included in `docs/licenses/origin-ui.txt`.

## Motion

Anime.js uses a component-local `createScope`, a staggered hero entrance,
intersection-triggered section entrances, and a brief product-tab transition.
Only transforms and opacity animate. Scopes and observers clean up on unmount.
Reduced-motion preference changes are handled live; content renders visible
without JavaScript. Focus and hash navigation complete applicable entrances.
There are no automatic carousels, infinite loops, or scroll hijacking.

## Verification

- Production build and TypeScript validation passed.
- ESLint and Prettier checks passed for the changed components and tests.
- Nine Playwright tests passed across landing interactions, legal consent,
  demo access, and creating a personal workspace with real coursework.
- Layouts were visually checked at 320, 390, 768, and 1440 CSS pixels, with
  no horizontal overflow or browser runtime errors.
- Keyboard tab navigation, FAQ expansion, mobile navigation and Escape,
  direct setup anchors, and reduced-motion behavior were checked.
- Local production Lighthouse mobile report: performance 93, accessibility
  100, best practices 100, SEO 100. Simulated LCP 3.2 seconds, CLS 0,
  total blocking time 60 ms. The report was saved successfully; the CLI then
  encountered a Windows temporary-profile cleanup error, unrelated to page
  audits. Reports and visual captures are under `.artifacts/landing/`.

## Assets

- `public/images/landing/dashboard.webp`
- `public/images/landing/planner.webp`
- `public/images/landing/assignments.webp`

These are real screenshots captured at 1440 x 940 from the existing local
ClassOS demo, using a separately seeded `.artifacts/landing-preview.db`.
They contain sample coursework only and are labelled as sample previews.

`public/images/landing/room-for-life.webp` is an editorial image generated
with the built-in image-generation tool, then encoded as WebP using Sharp.
The original generation is preserved under the Codex generated-images directory.

Generation prompt:

> Use case: photorealistic-natural. Asset type: premium ClassOS student productivity website editorial section photograph, wide landscape 3:2 aspect ratio. Create an exceptionally beautiful and believable quiet late afternoon outdoors on a university campus lawn, an expansive close-cropped field of vivid but natural green grass with a few tiny white daisies, on the lower right an open cream paper notebook (only abstract indistinct handwritten lines no readable words), simple over-ear brushed silver headphones and a cobalt blue canvas backpack resting together in the sun; upper half soft atmospheric out-of-focus trees and warm late-afternoon sunlight, plenty of empty grass on left and center. No person, no hands, no laptop, no screens, no fake interface, no logos, no text, no lettering, no watermark. This is about taking a peaceful break after studying. Medium format editorial photography, tactile canvas and paper, natural cinematic light, grounded shadows, lovely restrained color, calm, real life, no neon, no magical glows, no artificial rendered gradients. Landscape composition intended to be cropped to a wide landscape 16:9 card. One single seamless photo, no layout, no border.
