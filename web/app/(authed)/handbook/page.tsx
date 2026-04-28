import { requireCapability } from "@/lib/auth/requireCapability";
import {
  StaticHandbook,
  parseHandbookTab,
  type HandbookSection,
} from "@/components/handbook/StaticHandbook";
import { HandbookAction } from "@/components/handbook/HandbookAction";
import { ROUTES } from "@/lib/routes";

export default async function StudentHandbookPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  await requireCapability("self.read");
  const sp = await searchParams;
  return (
    <StaticHandbook
      persona="student"
      eyebrow="Workshop guide"
      title="How the workshop works"
      intro="30 days, one habit. Browse the four sections, and tap “Start interactive guide” on the Dashboard navigation tab for a screen-by-screen walkthrough."
      tab={parseHandbookTab(sp.tab)}
      yourRole={YOUR_ROLE}
      setup={SETUP}
      dayByDay={DAY_BY_DAY}
    />
  );
}

const YOUR_ROLE: HandbookSection[] = [
  {
    title: "What you signed up for",
    body: (
      <>
        <p>30 days, one daily habit. The workshop only works if you show up daily.</p>
        <ul>
          <li>Open today&apos;s lesson from your dashboard.</li>
          <li>Build the lab. Submit your output.</li>
          <li>Engage with your pod and the community board.</li>
        </ul>
        <p>
          Streaks matter more than perfection. A half-finished lab logged on time keeps
          your streak alive.
        </p>
        <HandbookAction href={ROUTES.learn}>Open today&apos;s lesson</HandbookAction>
      </>
    ),
  },
  {
    title: "Your pod",
    body: (
      <>
        <p>Your pod is a small group of students plus assigned faculty.</p>
        <ul>
          <li>Live-session breakouts happen here.</li>
          <li>Peer review of milestones is organised through the pod.</li>
          <li>Your faculty drops notes and reviews submissions.</li>
        </ul>
        <p>
          If you&apos;re not in a pod yet, an admin will assign you within 24 hours of
          enrolment.
        </p>
        <HandbookAction href={ROUTES.pod}>Open my pod</HandbookAction>
      </>
    ),
  },
  {
    title: "Submissions & grading",
    body: (
      <>
        <p>Most days have a submission. Some are graded, most are reviewed.</p>
        <ul>
          <li>Submit early; faculty review in batches twice a day.</li>
          <li>Late submissions still count toward your streak; reviews queue.</li>
          <li>Your pod faculty grades — they see context the AI doesn&apos;t.</li>
        </ul>
      </>
    ),
  },
  {
    title: "Etiquette",
    body: (
      <>
        <ul>
          <li>Public board for general questions. Help desk for personal blockers.</li>
          <li>Vote up posts that helped you. Don&apos;t pile on or down-vote noise.</li>
          <li>Real names + photos. Your pod knows you by them.</li>
          <li>Be kind. Workshop runs on goodwill.</li>
        </ul>
        <HandbookAction href={ROUTES.community}>Community board</HandbookAction>
        <HandbookAction href={ROUTES.helpDesk}>Help desk</HandbookAction>
      </>
    ),
  },
];

const SETUP: HandbookSection[] = [
  {
    title: "Laptop & browser",
    body: (
      <>
        <ul>
          <li>
            Any modern laptop (Mac, Windows, Linux). 8GB RAM is fine for everything but the
            optional local-LLM days.
          </li>
          <li>
            Latest Chrome, Edge, or Firefox. Safari works too — just keep it current.
          </li>
          <li>Stable internet for live sessions; dial-in is fine for the rest of the day.</li>
        </ul>
      </>
    ),
  },
  {
    title: "Tools to install before Day 1",
    body: (
      <>
        <ul>
          <li>
            <strong>VS Code</strong> (or your editor of choice). Most labs have you editing
            small files.
          </li>
          <li>
            <strong>Python 3.11+</strong> for the labs that need it. We&apos;ll prefer
            Google Colab where possible so installs aren&apos;t blocking.
          </li>
          <li>
            <strong>Git</strong> for the few labs that include version-control practice.
          </li>
        </ul>
        <p>
          The first lesson includes a checklist that walks you through each one. Don&apos;t
          stress if something doesn&apos;t work on Day 1 — open a help-desk ticket and your
          faculty will walk you through it.
        </p>
      </>
    ),
  },
  {
    title: "Accounts you'll need",
    body: (
      <>
        <p>
          The workshop deliberately exposes you to multiple AI tools. You&apos;ll compare
          ChatGPT, Claude, Gemini, and Grok side-by-side on Day 1 — feeling the
          personality differences is the lesson. Set everything up on Day 0.
        </p>
        <ul>
          <li>
            <strong>This account</strong> — already done.
          </li>
          <li>
            <strong>Free chat-UI accounts</strong>:{" "}
            <a href="https://chat.openai.com/">ChatGPT</a>,{" "}
            <a href="https://claude.ai/">Claude</a>,{" "}
            <a href="https://gemini.google.com/">Gemini</a>,{" "}
            <a href="https://grok.com/">Grok</a>. Free tiers are enough for every lab that
            uses the chat UI. Use your college email.
          </li>
          <li>
            <strong>Google account</strong> for Google Colab (free GPU notebooks), Drive
            for shared docs, and the AI Studio API key below.
          </li>
          <li>
            <strong>Google AI Studio API key</strong> (free, no card) — primary API key
            for programmatic prompting from Day 3 onward. Get it at{" "}
            <a href="https://aistudio.google.com/app/apikey">aistudio.google.com/app/apikey</a>.
            The free quota covers the full 30 days for student-scale workloads.
          </li>
          <li>
            <strong>Hugging Face account</strong> — free Inference API for the open-source
            model labs (Day 4: Sarvam, Mistral, Qwen, LLaMA, DeepSeek). Sign up at{" "}
            <a href="https://huggingface.co/join">huggingface.co/join</a> and create a
            read token.
          </li>
        </ul>
        <p>
          OpenAI / Anthropic <strong>API keys</strong> aren&apos;t required by default. A
          few labs let you swap them in if you have credits already; we&apos;ll always
          provide a Gemini-or-HF path so cost isn&apos;t a barrier.
        </p>
      </>
    ),
  },
  {
    title: "Profile & timezone",
    body: (
      <>
        <p>Update your profile on Day 0:</p>
        <ul>
          <li>Set your full name as you&apos;d like to appear on the certificate.</li>
          <li>Upload an avatar — your pod and faculty know you by it.</li>
          <li>
            Set your college / organisation. Used for grouping in the leaderboard and
            showcase.
          </li>
        </ul>
        <HandbookAction href={ROUTES.profileSettings}>Edit profile</HandbookAction>
      </>
    ),
  },
];

const DAY_BY_DAY: HandbookSection[] = [
  {
    title: "A typical day",
    body: (
      <>
        <ul>
          <li>
            <strong>Morning:</strong> open today&apos;s lesson. Read once, then start the
            lab.
          </li>
          <li>
            <strong>Mid-day:</strong> live session (if scheduled). Pod breakouts happen
            inside the call.
          </li>
          <li>
            <strong>Afternoon:</strong> finish the lab, polish, submit.
          </li>
          <li>
            <strong>Evening:</strong> answer one community-board question. Reflect briefly.
          </li>
        </ul>
        <HandbookAction href={ROUTES.learn}>Open today&apos;s lesson</HandbookAction>
      </>
    ),
  },
  {
    title: "Live sessions",
    body: (
      <>
        <ul>
          <li>Show up on time; the recording isn&apos;t a substitute.</li>
          <li>Camera on if you can. Helps the energy and the breakouts.</li>
          <li>Bring questions. The session is yours, not the speaker&apos;s.</li>
        </ul>
      </>
    ),
  },
  {
    title: "When you're stuck",
    body: (
      <>
        <ul>
          <li>
            <strong>Tech blocker?</strong> Help desk → tagged tech, escalates to staff
            automatically.
          </li>
          <li>
            <strong>Conceptual confusion?</strong> Community board first — likely someone
            else hit the same wall.
          </li>
          <li>
            <strong>Personal / sensitive?</strong> DM your faculty (their contact is on the
            pod page).
          </li>
        </ul>
        <HandbookAction href={ROUTES.helpDesk}>Open help desk</HandbookAction>
        <HandbookAction href={ROUTES.community}>Community board</HandbookAction>
      </>
    ),
  },
  {
    title: "Milestones",
    body: (
      <>
        <p>
          Three checkpoints — at days 6, 16, and 29 — collect your work into pitched
          deliverables. Faculty review each milestone with written feedback.
        </p>
        <ul>
          <li>M1 (day 6): rough idea + first prototype draft.</li>
          <li>M2 (day 16): tightened idea + a working slice.</li>
          <li>M3 (day 29): demo-ready capstone.</li>
        </ul>
      </>
    ),
  },
  {
    title: "Certificate & after",
    body: (
      <>
        <ul>
          <li>
            Certificate is auto-generated on Day 30 if you hit the streak + capstone bar.
          </li>
          <li>Your capstone publishes to the showcase if you opt in.</li>
          <li>
            Alumni office hours open four weeks later — sign up to mentor a Day-1 student
            in the next cohort.
          </li>
        </ul>
        <HandbookAction href={ROUTES.certificate}>My certificate</HandbookAction>
        <HandbookAction href={ROUTES.showcase}>Showcase</HandbookAction>
      </>
    ),
  },
];
