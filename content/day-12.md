---
reading_time: 14 min
tldr: "Git is a reasoning system for change. Learn to read PRs and commit graphs; AI handles the commands."
tags: ["concepts", "git", "shipping"]
video: https://www.youtube.com/embed/VIDEO_ID
lab: {"title": "GitHub PR walkthrough + Oh My Git!", "url": "https://ohmygit.org/"}
resources: [{"title": "GitHub docs", "url": "https://docs.github.com/"}, {"title": "Oh My Git!", "url": "https://ohmygit.org/"}, {"title": "GitHub", "url": "https://github.com/"}]
---

## Intro

Software is never written, only rewritten. Today you learn the mental model for how teams track, review, and ship changes — without typing a single git command. You'll read pull requests, annotate commit graphs, and build intuition for the workflow every company on earth uses.

## Read: Version control as a time machine

### The core idea

Imagine Google Docs' "version history", but designed by engineers who don't trust each other. That's git.

- Every change is a **commit** — a labeled snapshot of the whole project.
- Commits form a **graph** — usually linear but can branch and merge.
- Each person works on a **branch** — a parallel timeline they can mess with freely.
- When ready, they **merge** back into `main` — the canonical timeline everyone trusts.

```
  main:   o---o---o-----------------o---o
               \                   /
  feature:      o---o---o---o---o-+
```

Everything else is detail.

### Why teams need this

- **History**: who changed what, when, and why.
- **Rollback**: a bad deploy? Revert the commit, redeploy the previous snapshot.
- **Parallel work**: 5 people, 5 branches, no one overwrites the others.
- **Review**: code is reviewed *before* it hits `main`, via pull requests.
- **Attribution**: `git blame` (ugly name, useful feature) shows who last changed a given line.

> Git is not a backup system. It's a *reasoning* system for change over time.

### The vocabulary, once

| Term | Plain English |
|---|---|
| Repository (repo) | A project folder tracked by git |
| Commit | A saved snapshot with a message |
| Branch | A parallel timeline off `main` |
| Merge | Bringing a branch's changes into another |
| Pull request (PR) | "Please review and merge my branch" |
| Remote | A copy of the repo on another machine (usually GitHub) |
| Clone | Copy a remote repo locally |
| Push / pull | Upload / download changes |
| Diff | The delta between two states |
| Conflict | Two branches changed the same lines differently |
| Revert | Undo a commit by making a new "opposite" commit |

### The GitHub workflow (what every team actually does)

```
  1. clone       -- copy the repo to your machine
  2. branch      -- git checkout -b fix/login-bug
  3. work        -- edit files (AI does the typing in 2026)
  4. commit      -- snapshot with a message
  5. push        -- upload the branch to GitHub
  6. open PR     -- request review
  7. review      -- teammates comment, you iterate
  8. CI runs     -- tests + lint automatically
  9. merge       -- once approved + green, branch merges into main
 10. deploy      -- main (or a release) goes to production
```

This is called **trunk-based development with short-lived branches**. It's the default in 2026.

### What a commit message looks like

```
Example — you're reading, not typing.

fix(login): handle expired session cookie gracefully

Previously, an expired cookie triggered an unhandled 500.
Now we redirect to /login and surface a toast. Fixes #412.
```

A good message answers *what* and *why* — never just *what*. The AI will write these for you in Week 3; you'll learn to grade them.

### The commit graph, visually

```
  *   a1b2c3  (main)  Merge PR #42
  |\
  | * 9f8e7d  Add CGPA filter to /students
  | * 7c6b5a  Sketch UI for placement board
  |/
  *   4d3c2b  Initial schema
```

Read top to bottom, newest first. Stars are commits, lines are lineage, merges close a branch back into main. Once you can read this, you can read any project's history.

### Pull requests — the atomic unit of shipping

A PR has four moving parts:

1. **The diff** — exactly which lines changed.
2. **The description** — what and why, often with screenshots or a Loom.
3. **Reviews** — approvals, change requests, line-by-line comments.
4. **Checks** — automated CI: tests passed? linter clean? build green?

Good PRs are small (< 400 lines changed), focused (one thing), and well-described. Bad PRs are huge, scattered, and labeled "misc fixes". You will review many PRs in your career. Starting to read them now pays compounding dividends.

### CI/CD: from commit to customer

- **CI (Continuous Integration)**: every push auto-runs tests on a fresh machine.
- **CD (Continuous Deployment)**: once merged to main, it auto-deploys.

```
  push --> GitHub --> CI runs tests --> CD builds image --> deploy to server --> users
```

In 2026, Vercel, Netlify, Cloudflare Pages, Railway, and Render give you this pipeline for free. You push; they ship. We'll use this on Day 14.

### Open source etiquette (why it matters for you)

A strong GitHub profile is the new resume. Employers look at:

- Commit frequency and cadence.
- The quality of your README and PR descriptions.
- Contributions to other projects.
- Issues you've filed that are useful to others.

Aim to be a good citizen. Write clear issues. Write clear PRs. Thank reviewers. Your future self is hiring your present self.

## Watch: Git explained with drawings

One explainer with visual branch diagrams. The second optional watch: a real PR review from a senior engineer.

https://www.youtube.com/embed/VIDEO_ID
<!-- TODO: replace video -->

- Watch for branches diverging and reconverging.
- Notice how reviewers think about *why* as much as *what*.
- Pay attention to the "squash and merge" option — it collapses messy history.

## Lab: Read a real pull request (35 min)

No typing. No terminal.

1. Go to `github.com/facebook/react` (or any popular OSS repo you like — `vercel/next.js`, `tldraw/tldraw`).
2. Click the **Pull requests** tab → filter by **Closed**. Pick any merged PR with at least 5 comments.
3. Read the PR description. Summarize it in one sentence on your worksheet.
4. Open the **Files changed** tab. Count the files, and estimate the diff size.
5. Read the **Conversation** tab end to end. Note one piece of useful feedback a reviewer gave.
6. Click the PR author's profile. Look at their contribution history. Observation: what does a serious contributor's profile look like?
7. Switch to the repo's **Insights → Network** view. Screenshot the commit graph. Annotate one merge and one branch point in Excalidraw.
8. (Optional) Play `https://ohmygit.org/` — the OSS card game that teaches git visually — for 15 minutes.

Submit the worksheet + annotated graph.

## Quiz

4 questions: given a commit graph diagram, identify the merge; given a PR description, decide if it's good; explain why short-lived branches beat long-lived ones; define "CI" in your own words.

## Assignment

Pick any merged PR on any public repo. Write a 250-word "PR review of the PR review": what did the author do well, what could have been better, what would you as a reviewer have asked? Attach a screenshot of the PR. No code.

## Discuss: Working in the open

- Your teammate opened a 3,000-line PR titled "stuff". What do you do?
- Why do companies prefer many small commits over one giant one?
- "Move fast and break things" vs "require 2 approvals on every PR" — when is each right?
- How would the PR workflow change if AIs are generating most of the diffs (as they will on Day 13)?
- A famous open-source maintainer reviews 20 PRs a day. What signals let them decide quickly?
