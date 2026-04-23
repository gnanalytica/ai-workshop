---
reading_time: 12 min
tldr: "The demo is won or lost in the first 30 seconds — today you rehearse until it is boring, then polish your showcase."
tags: ["launch", "demo", "rehearsal", "showcase"]
video: https://www.youtube.com/embed/Unzc731iCUY
lab: {"title": "Two full dry-runs + showcase polish", "url": "/showcase.html"}
prompt_of_the_day: "Critique this 3-minute demo transcript {{transcript}} for a live panel. Score on hook (0-10), story arc (0-10), call to action (0-10). Give 3 specific line-level rewrites and 2 cut suggestions."
tools_hands_on: [{"name": "Showcase page", "url": "/showcase.html"}, {"name": "Loom", "url": "https://loom.com"}, {"name": "Descript", "url": "https://descript.com"}]
tools_demo: [{"name": "Instructor dress rehearsal", "url": "/showcase.html"}, {"name": "YC Demo Day archives", "url": "https://www.ycombinator.com/library"}]
tools_reference: [{"name": "YC Library", "url": "https://www.ycombinator.com/library"}, {"name": "Nancy Duarte on presenting", "url": "https://www.duarte.com"}]
resources: [{"name": "YC Demo Day tips", "url": "https://www.ycombinator.com/library"}]
objective:
  topic: "Dress rehearsal, stage-craft, line-level demo polish"
  tools: ["Loom", "Descript", "Showcase page", "YC Demo Day archives"]
  end_goal: "Ship a re-recorded final rehearsal video, a live showcase entry with opt-in ON, and pre-recorded fallback clips for any slow API call."
---

## 🎯 Today's objective

**Topic.** Dress rehearsal, stage-craft, line-level demo polish

**Tools you'll use.** Loom or Descript for recording, the Showcase page for public entries, YC Demo Day archives as reference.

**End goal.** By the end of today you will have:
1. Two full timed dry-runs completed and watched back.
2. A re-recorded final rehearsal video posted to the cohort.
3. Your showcase.html entry toggled live with opt-in ON — URL, screenshot, 1-line tagline confirmed.
4. Pre-recorded fallback clips for any API call > 3 seconds.

> *Why this matters:* One day out. Every past cohort that lost a demo lost it because they built until 11pm on Day 29. Say it out loud: "I will not add a feature today."

---

### 🌍 Real-life anchor

**The picture.** Theater **dress rehearsal**: same script, same cues, same shoes — you are not rewriting the play; you are burning muscle memory so opening night feels boring in a good way.

**Why it matches today.** Day 29 is rehearsal discipline: **timing, backup clips, hook** — polish and nerves, not new plot twists.

## ⏪ Pre-class · ~20 min

**Faculty note.** Budget ~2 minutes for the 🌍 *Real-life anchor* above — read it aloud or ask one volunteer to restate it in their own words — so the analogy lands before setup.

**Revision / context.** Day 28 you built a signal pipeline for *after* demo day. Today zooms back in on the demo itself. Your Day 25 mini-demo surfaced the critiques; your Week 6 build addressed the scoped changes; the model card from Day 27 and the safety fixes from Day 26 are in. All of that work exists so that today, rehearsal can be about *delivery*, not fixing the product.

### Quick glossary

- **Dry-run** — a full end-to-end rehearsal of your demo, timed, recorded, watched back.
- **Stage craft** — voice, eyes, pauses, pacing; the non-product half of a demo.
- **Hook / story / ask** — the three beats of a 4-minute demo: 30 sec / 2 min / 30 sec.
- **Critique** — specific, line-level feedback: what to cut, rewrite, sharpen.
- **Showcase page** — the public /showcase.html entry with your live URL, tagline, and screenshot.

### Setup
- [ ] Full 3-minute demo practice recorded on webcam — watched back at least once.
- [ ] Polished deck (5-8 slides max) exported to PDF as a backup.
- [ ] Live capstone URL loaded in tab 1; pre-recorded Loom backup loaded in tab 2.
- [ ] [Loom](https://loom.com) or [Descript](https://descript.com) installed and mic tested.

### Primer (~5 min)
- **Read**: one YC Demo Day retro in the [YC Library](https://www.ycombinator.com/library) — steal one hook formula.
- **Watch** (optional): [instructor dress rehearsal video](https://www.youtube.com/embed/Unzc731iCUY) — note the bridge-to-key-message moments.

### Bring to class
- [ ] Hook, story, ask written as three separate paragraphs in your submission doc.
- [ ] Your webcam self-tape link (raw, not polished — we want honest feedback).
- [ ] One demo question you're dreading — we'll workshop the bridge live.

---

## 🎥 During class · live session

### Agenda

| Block | Time | What |
|---|---|---|
| Setup | 5 min  | Projector/screen share, order of rehearsal |
| Full dry-run (rotating) | 30 min | Each team runs their demo end-to-end |
| Peer + instructor feedback | 15 min | What to fix in next 24h |
| Showcase polish Q&A | 10 min | Showcase page, assets, final checks |

### In-class checkpoints

- **Live poll (LMS)** — Run the **dashboard Live poll** for today so counts match in-class discussion (same wording as the official cohort poll for this day).
- **Setup**: projector/screen share confirmed, rehearsal order drawn live, timer on screen visible to all.
- **Team 1 dry-run (4 min)** → **00:09 — 2 min feedback**: one "keep," one "cut," one "sharpen" from peers; instructor adds a line-level rewrite.
- **Team 2 dry-run (4 min)** → **00:15 — 2 min feedback**: same structure; timer is strict — when it buzzes, the hook has to have landed.
- **Team 3 dry-run → 2 min feedback**; **00:23 — Team 4 dry-run → 2 min feedback**; **00:29 — Team 5 dry-run → 2 min feedback**. Rotate through remaining teams in the same 6-minute slots.
- **Showcase polish Q&A**: page live, opt-in ON, URL/screenshot/tagline confirmed. Final go/no-go per team before tomorrow.

### Read: Stage-craft for Four-Minute Demos (550 words)

A demo is not a product walkthrough. It's a story with a product in it. Four minutes, three beats: hook, story, ask.

#### The 30-second hook

Your first sentence decides whether the panel leans in or looks at their phones. Bad hooks sound like: "Hi, I'm X and I built Y, a tool for Z users to do A." Good hooks sound like: "Last month, my mother paid a scammer $4,000. Today I'll show you the agent that would have caught it." The hook names a real pain, in concrete language, with a human in it.

Three formulas that work:
- **Before/After** — "Before this, X took 3 hours. Now it takes 12 seconds."
- **Named pain** — one real user, one real moment, one real cost.
- **Heretical claim** — "Everyone says RAG is dead. I'll show you why they're wrong in 3 minutes."

#### The 2-minute story

Not a feature tour. A narrative: problem → attempt → turn → payoff. Show one complete end-to-end path. Do not show the settings screen. Do not show the login. Do not show the empty state. Skip to the moment of value.

Pre-record the slow parts. Have a local backup if the API fails. Have a screenshot fallback if the whole thing fails. The panel will not penalize a graceful fallback. They will penalize a frozen screen.

#### The 30-second ask

End with what you want. Specifically. "I'm looking for 3 beta users in healthcare ops. DM me." or "I'm hiring my first engineer. Here's my email." Vague asks get vague responses. The ask is the only reason anyone should remember you tomorrow.

#### Voice, eyes, pauses

Three rules, in order of impact:
1. **Look at the camera lens, not the screen.** Tape a sticky note next to it that says "EYES."
2. **Project like you're talking to someone across a café.** Not a library. A café.
3. **Pause after every hook line.** Silence reads as confidence.

#### Handling panel questions: bridge-to-key-message

Panels will ask sharp questions. The bridge technique: acknowledge → bridge → redirect to your key message. "Great question about scale — and what we've seen is that even at 10x load, our moat is actually our eval loop, which is what lets us …" You are not dodging. You are honoring the question while steering toward strength. Practice one bridge per anticipated hard question.

#### Three mistakes that kill demos

1. **The grand tour** — showing every feature instead of one story.
2. **The live API gamble** — relying on a call that takes 12 seconds on stage.
3. **The soft ask** — "Um, if anyone's interested, let me know."

### Watch: Instructor Dress Rehearsal + Common Mistakes (12 min)

https://www.youtube.com/embed/Unzc731iCUY

Live walkthrough of a full demo with mistakes and fixes, then a critique of two past student demos.

### Lab: Dry-run twice + showcase polish (30 min)

1. **Dry run #1** — record yourself (Loom or phone). Full 4 minutes. Watch it back (12 min).
2. **Cut and rewrite** — identify 3 line-level fixes. Rewrite hook and ask (5 min).
3. **Dry run #2** — record again. This one goes to the cohort (10 min).
4. **Showcase page** — toggle your entry live on showcase.html, confirm URL, screenshot, 1-line tagline, opt-in public flag ON (3 min).

> ⚠️ **If you get stuck**
> - *Loom/phone recording cuts your screen share or audio* → record screen and audio in two separate files and sync in Descript; don't burn rehearsal time debugging one tool on demo-minus-one.
> - *Your live API freezes mid-rehearsal* → that is exactly why you pre-record the slow parts; swap to the backup tab now and practice the graceful handoff line ("of course, on stage — here's the recording") so it's muscle memory tomorrow.
> - *You keep running over 4 minutes* → cut the second half of the story, not the hook or the ask; the middle is where bloat hides, and the panel will never miss a feature they didn't know existed.

Afternoon: final capstone polish. No new features. Only fixes and polish.

### Live discussion prompts — Your Hook, Workshopped

| Prompt | What a strong answer sounds like |
|---|---|
| Post your 30-second hook as a single paragraph. | Opens with a human and a specific pain (named cost, named moment), not a product category. Reads in 25-30 seconds when spoken aloud. No "Hi, I'm X and I built Y." |
| Read three others and comment with "what landed, what to cut, what to sharpen." | Each of the three comments quotes the exact phrase that worked or didn't. Concrete rewrites beat vague praise — "swap 'users' for 'my mother'" is the bar. |

The cohort that workshops hooks together demos better together.

---

## 📝 Post-class · ~2 hour focused block

Block the evening. Phone on DND. Do these in order.

### 1. Immediate action (~40 min)
1. Apply the 3 line-level fixes from peer + instructor feedback — cut, rewrite, sharpen.
2. Re-record the final rehearsal video (Loom) — this one is the one you'd be proud to ship.
3. Toggle your [showcase.html](/showcase.html) entry live with opt-in ON; confirm URL, screenshot, and 1-line tagline.
4. Pre-record the slow parts of your demo (any API call > 3s) as a fallback video clip.
5. Sleep early. Hydrate. Lay out clothes for tomorrow. Seriously.

### 2. Reflect (~5 min)
Close your laptop, say your 30-second hook out loud three times. Does it still sound like you, or like a robot? Rewrite if it's the second one.

### 3. Quiz (~17 min)

Includes transfer scenarios + spaced recall from earlier days (~8+ items total). If a question feels easy, treat it as speed practice.
1. What are the three beats of a 4-minute demo?
2. Name two formulas for a strong hook.
3. What is the bridge-to-key-message technique for?
4. Why do you pre-record slow parts?
5. What makes an ask memorable?

### 4. Submit the assignment (~5 min)

- Showcase page live with opt-in toggle ON
- 3-minute rehearsal video recorded and posted to cohort
- Hook, story, ask written as three separate paragraphs in your submission doc

**Peer or self-review:** One line (chat or DM): what changed after someone skimmed your artifact — or the biggest gap if you worked solo.

**Stretch (optional):** Pick one rubric row and over-ship it (extra example, tighter screenshot, or second iteration).


### 5. Deepen (optional ~30 min)
- **Extra video**: one more YC Demo Day archive demo — note the specific line where they name a human.
- **Extra read**: [Nancy Duarte on presenting](https://www.duarte.com) — skim her "resonate" framework.
- **Try**: rehearse the demo standing up with phone recording — energy reads different on camera than sitting.

### 6. Prep for Day 30 (~30-40 min — important)

**Tomorrow you ship.** Live demo to the panel + guest judges, awards ceremony, certificate auto-issues at 30/30, showcase gallery goes public.

- [ ] **Arrive 10 minutes early** — seriously, not 2 minutes early.
- [ ] **Test** your live URL on a fresh browser (incognito, different wifi if you can). Confirm your pre-recorded backup tab is open and plays with sound.
- [ ] **Memorise** your specific 30-second ask.
- [ ] **Say your hook out loud** once in the mirror.
- [ ] **Optional watch**: 2 minutes of a favourite demo — borrow the energy, not the words.
- [ ] **Gratitude**: message one cohort peer and say thanks before you walk in.
- [ ] **Prep final submission artifacts** ready to post tonight: live URL, repo link, pitch deck, 30-second teaser video, 200-word "What I'll do next" draft.

---

## 📚 Extra / additional references

### Pre-class primers
- [YC Library — Demo Day tips](https://www.ycombinator.com/library)
- [Loom](https://loom.com) / [Descript](https://descript.com) for recording.

### Covered during class
- [Instructor dress rehearsal](https://www.youtube.com/embed/Unzc731iCUY)
- [Showcase page](/showcase.html)
- Hook / story / ask structure; bridge-to-key-message for Q&A.

### Deep dives (post-class)
- [Nancy Duarte on presenting](https://www.duarte.com)
- [YC Demo Day archives](https://www.ycombinator.com/library) — watch 3 more this weekend.

### Other videos worth watching
- Any Steve Jobs keynote with the sound off — watch the pauses, the eye contact, the silence after the hook line.
