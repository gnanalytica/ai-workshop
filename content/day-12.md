---
reading_time: 15 min
tags: ["git", "fundamentals", "hands-on"]
video: https://www.youtube.com/embed/VIDEO_ID
lab: {"title": "Branch, PR, and review on a real GitHub repo", "url": "https://example.com/labs/day-12"}
resources: [{"title": "Git docs", "url": "https://git-scm.com/"}, {"title": "Pro Git book (free)", "url": "https://git-scm.com/book/en/v2"}, {"title": "GitHub docs", "url": "https://docs.github.com/"}, {"title": "GitHub flow", "url": "https://docs.github.com/en/get-started/using-github/github-flow"}]
---

## Intro

Every professional team in the world uses Git. Not knowing it past `add`, `commit`, `push` is the single clearest tell of a beginner. Today you'll work the way real teams do: feature branches, pull requests, code review, protected `main`, and clean history.

## Read: The parts of Git that matter

### Mental model: three trees

Git doesn't have one "place" for your code. It has three, and most confusion comes from not knowing which is which.

| Tree | What it is | Moves code via |
|------|------------|----------------|
| Working directory | your files on disk | editing |
| Staging area (index) | what *will* be in the next commit | `git add` |
| Repository | committed history | `git commit` |

Remote (`origin`) is a fourth tree, on GitHub. `git push` moves commits there; `git fetch` / `git pull` brings them back.

### The daily loop

```bash
git status                       # what's changed?
git switch -c feat/search-box    # new branch from current
# ...edit files...
git add app.js style.css         # stage specific files, not -A blindly
git commit -m "Add search box to events list"
git push -u origin feat/search-box
# open a PR on GitHub
```

### Good commits vs. bad commits

> A good commit message finishes the sentence: *"If applied, this commit will …"*

Bad: `fix stuff`, `wip`, `asdf`, `final final v2`.
Good: `Add search filter to events list`, `Fix 429 retry backoff in explorer`.

Keep each commit focused on one thing. Reviewers reading your PR should be able to understand any single commit on its own.

### Branching strategy: GitHub flow

For a 30-day project and most small teams, you don't need git-flow or release branches. Just:

1. `main` is always deployable.
2. Every change goes in a branch named `feat/...`, `fix/...`, or `chore/...`.
3. Open a PR. Someone else reviews.
4. Squash-merge into `main`. Delete the branch.

### Pull requests are communication, not just merging

A good PR has:

- A **title** that reads like a commit message.
- A short **description**: *what* and *why*, plus any screenshots or before/after.
- Linked **issue** (`Closes #12`).
- Passing **CI** (we'll add this on Day 14).
- At least one **review** approval.

### Protect `main` from yourself

In GitHub → Settings → Branches → Add rule for `main`:

- Require pull request before merging
- Require at least 1 approving review
- Require status checks to pass
- Include administrators

This prevents the 11 pm "I'll just push to main" that takes down the demo.

### Fixing mistakes without panic

```bash
git restore app.js                  # discard unstaged changes in file
git restore --staged app.js         # unstage (keeps edits)
git commit --amend                  # fix last commit message / add forgot file
git reset --soft HEAD~1             # undo last commit, keep changes staged
git revert <sha>                    # new commit that undoes <sha> (safe on shared branches)
```

Never `git push --force` on `main` or anyone else's branch. On your *own* feature branch, `--force-with-lease` is ok.

### `.gitignore` and secrets

Before your first commit, create a `.gitignore`:

```
.venv/
__pycache__/
.env
node_modules/
.DS_Store
*.sqlite
```

If you ever commit a secret: rotate the secret *first*, then scrub history (or just delete the repo and start over for a small project). Git history is permanent by default.

## Watch: Branching, PRs, and reviews on a real repo

A walkthrough of a single feature from "I have an idea" to merged PR, including how the reviewer leaves line comments and how the author addresses them.

https://www.youtube.com/embed/VIDEO_ID
<!-- TODO: replace video -->

- Watch how the author splits changes into small commits, not one giant one.
- Notice the reviewer asks *why*, not just *what*.
- See how the PR description links to the issue and explains tradeoffs.

## Lab: Team up and ship a PR

Do this with a partner. If you don't have one, play both roles (but the lesson is muted).

1. One teammate creates a new GitHub repo `campus-notes` (public, with README and MIT license). Add the other as a collaborator.
2. Clone it: `git clone git@github.com:<user>/campus-notes.git && cd campus-notes`.
3. In GitHub → Settings → Branches, add a protection rule on `main`: require PR, require 1 review, require branches to be up to date.
4. Open an issue: *"Add a simple note-taking HTML page with title + body + save to localStorage"*.
5. Person A: `git switch -c feat/note-form`, add `index.html` with a form and a save button wired to `localStorage`. Commit in 2–3 small commits. Push. Open a PR, link the issue, add a screenshot.
6. Person B: review the PR. Leave **at least two line comments** (one nitpick, one substantive suggestion). Don't approve yet.
7. Person A: address comments. Push new commits (don't force-push). Reply to each comment.
8. Person B: approve and squash-merge. Delete the branch on GitHub.
9. Both: `git switch main && git pull` to sync local `main`. Confirm the feature branch is gone locally: `git branch -d feat/note-form`.
10. Swap roles and repeat for a second feature: *"Add a list of saved notes below the form"*. This time include a deliberate bug; reviewer must catch it.

Stretch: set up GitHub Actions to run a tiny check on every PR (e.g., `npx htmlhint index.html`). You'll extend this on Day 14.

## Quiz

Four questions on the three-tree model, what `git reset` vs. `git revert` do, why you'd protect `main`, and how to recover a file you accidentally `git restore`d. One short answer on writing a good commit message.

## Assignment

Submit a link to your `campus-notes` repo with at least two merged PRs, each with at least one review comment addressed. In `CONTRIBUTING.md`, write a 5-line description of your team's branch naming and review rules.

## Discuss: Git culture

- Squash-merge vs. merge commit vs. rebase-merge. What does each optimize for? What did your team pick and why?
- A teammate force-pushes to `main` and loses your commits. Walk through the recovery, step by step.
- "Commit early, commit often" vs. "one commit per logical change." Where's the real line?
- When is it ok to merge your own PR without review? (Hint: almost never in a team; some cases on solo projects.)
