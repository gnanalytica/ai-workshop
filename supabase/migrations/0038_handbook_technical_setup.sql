-- Handbook: add **Setup & tools** content (lab_environment) and cross-link from platform guide.
-- Aligns app tabs (HandbookView) with on-call lab prep; supersedes legacy setup-guide.html references.

insert into faculty_pretraining_modules (slug, title, body_md, ordinal, category)
values (
  'lab_environment',
  'Lab environment & tooling',
  $hb$
*Last updated with this release. For cohort-specific pins (exact versions), follow email from your program lead.*

This module is the **Setup & tools** area of the faculty Handbook—separate from **Your role & workflow**, which covers navigation and how to run sessions.

## Before you install anything

- Use a **Google account** that matches your cohort (sign-in to the app and to tools that require Google).
- Prefer **current stable** releases of each tool; if your lab images a standard build, use that image and treat the sections below as a **checklist to verify** rather than a mandate to re-download.
- If something fails, capture the **error text** and use **Help desk** (or your program’s escalation path) so platform staff can help.

## Browser

- **Chrome** (or Chromium-based) is the usual default for labs and for AI Studio.
- **Install / update:** from your OS vendor or [Google Chrome](https://www.google.com/chrome/).
- **Verify:** open the app, sign in, and open a day page; confirm embedded video and MDX render.

## Editor & AI coding tools

- **VS Code** (or your program’s standard editor) for light edits to curriculum or handouts when needed.
- **Optional:** [Cursor](https://cursor.com/) or [Antigravity](https://antigravity.google/) when your cohort uses those for vibe-coding or agent-style flows—use the versions your handout names.
- **Verify:** from a terminal or the editor’s about box, note the version in your cohort’s “known good” list if you maintain one.

## Runtimes (Node & Python) — if your lab uses them

- **Node.js** — LTS from [nodejs.org](https://nodejs.org/). Verify: `node -v` and `npm -v` in a terminal.
- **Python** — 3.10+ is typical; use your cohort’s version. Verify: `python3 --version` and `pip --version` (or `pip3`).

## Git

- Install **Git** from your OS or [git-scm.com](https://git-scm.com/). Verify: `git --version`.
- Configure `user.name` and `user.email` for commits if students push to a shared org—match what your program requires.

## Optional: local models (Ollama, etc.)

- Some weeks use a **local** model runner. If your handout says so, install [Ollama](https://ollama.com/) (or the named tool) and pull the **exact model** your instructor lists.
- Verify with the command your day sheet provides (e.g. a short generation test).

## Quick verification pass

- [ ] Browser opens learn URL and you stay signed in.
- [ ] Any required editor/agent tool launches and is on the version your cohort tracks.
- [ ] `node` / `python3` / `git` work in a **new** terminal if the curriculum uses them.
- [ ] You know where to report a broken lab image (**Help desk** for product issues, program email for local IT).

## Relationship to the rest of the playbook

- **Navigation, pods, help desk, community** → use **Handbook → Your role & workflow** (*Using the workspace…*).
- **This page** is for **machine and toolchain** prep so sessions start on time.
$hb$,
  7,
  'technical'::handbook_category
)
on conflict (slug) do update set
  title = excluded.title,
  body_md = excluded.body_md,
  ordinal = excluded.ordinal,
  category = excluded.category;

-- Point readers from the main platform module to the technical tab.
update faculty_pretraining_modules
set
  body_md = body_md
    || $x$

---

## Lab and machine setup

For **browser, editor, runtimes, Git, and optional local models**, open this Handbook’s **Setup & tools** tab and use **Lab environment & tooling**—or stay on **Your role & workflow** if you only need navigation and session flow.
$x$
where slug = 'platform_faculty'
  and body_md not like '%Lab and machine setup%';
