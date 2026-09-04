# ClassOS

Modern student dashboard — instant overview of the school day. Dark-mode first, inspired by Linear / Notion / Arc.

## Stack

- Next.js 16 (App Router) + TypeScript
- Tailwind CSS 4
- `src/` directory (`@/*` alias)

## Getting Started

```bash
npm install
npm run dev
```

Open http://localhost:3000

## Scripts

- `npm run dev` — dev server (Turbopack)
- `npm run build` — production build
- `npm run start` — start prod server
- `npm run lint` — ESLint

## Dashboard

- `src/app/page.tsx` — Student dashboard (Focus Now, Today, Upcoming, Catch-Up, Weekly Workload)
- `src/lib/mockData.ts` — Mock student data (timetable, assignments, catch-up)
- `src/lib/types.ts` — Shared types
- `src/components/dashboard/*` — Dashboard sections

Data layer is mocked but structured for DB connection (`types.ts` as contract).
