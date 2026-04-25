# ai-workshop / web

Next.js 15 (App Router) + React 19 + Tailwind v4 + Supabase. Single SaaS LMS for the 30-day AI workshop.

## Quick start

```bash
pnpm install
cp .env.example .env.local   # fill Supabase keys
pnpm dev                     # http://localhost:3000
```

## Scripts

| Command          | What it does                            |
|------------------|-----------------------------------------|
| `pnpm dev`       | Next dev server with Turbopack          |
| `pnpm build`     | Production build                        |
| `pnpm typecheck` | `tsc --noEmit`                          |
| `pnpm lint`      | ESLint flat config                      |
| `pnpm test`      | Vitest (unit + component)               |
| `pnpm e2e`       | Playwright e2e                          |

## Layout

```
app/             routes (public, student, faculty, admin)
components/      UI: shell/, ui/, kpi/, data-table/, …
lib/             supabase/, auth/, rbac/, format/, content/, realtime/
content/         day-01.mdx … day-30.mdx (curriculum source)
tests/           unit + e2e
```

See `docs/` (top of repo) for architecture notes; CLAUDE.md is the entry point.
