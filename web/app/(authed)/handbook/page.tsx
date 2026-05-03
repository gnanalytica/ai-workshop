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
      intro="30 days, one daily habit. Read the sections below, or open “Start interactive guide” from the Dashboard navigation tab for a screen-by-screen tour."
      tab={parseHandbookTab(sp.tab)}
      yourRole={YOUR_ROLE}
      setup={SETUP}
      dayByDay={DAY_BY_DAY}
    />
  );
}

const YOUR_ROLE: HandbookSection[] = [
  {
    title: "What you agreed to do",
    body: (
      <>
        <p>30 days, one habit each day. The workshop only works if you join in every day.</p>
        <ul>
          <li>Open today&apos;s lesson from your dashboard.</li>
          <li>Do the lab. Submit your work.</li>
          <li>Take part in your pod and the community board.</li>
        </ul>
        <p>
          Doing it every day matters more than doing it perfectly. Even a half-finished lab,
          submitted on time, keeps your daily streak going.
        </p>
        <HandbookAction href={ROUTES.learn}>Open today&apos;s lesson</HandbookAction>
      </>
    ),
  },
  {
    title: "Your pod",
    body: (
      <>
        <p>Your pod is a small group of students with one assigned faculty member.</p>
        <ul>
          <li>Small-group activities during live sessions happen inside your pod.</li>
          <li>Pod members review each other&apos;s milestone work.</li>
          <li>Your faculty leaves notes and reviews your submissions.</li>
        </ul>
        <p>
          If you have not been added to a pod yet, an admin will assign you within 24 hours
          of joining.
        </p>
        <HandbookAction href={ROUTES.pod}>Open my pod</HandbookAction>
      </>
    ),
  },
  {
    title: "Submissions & grading",
    body: (
      <>
        <p>Most days have a submission. Some are graded; most are reviewed.</p>
        <ul>
          <li>Submit early. Faculty review submissions twice a day.</li>
          <li>Late submissions still count toward your streak. They will be reviewed in turn.</li>
          <li>Your pod faculty grades your work — they understand the context that AI does not.</li>
        </ul>
      </>
    ),
  },
  {
    title: "Etiquette",
    body: (
      <>
        <ul>
          <li>Use the public board for general questions. Use the help desk for personal problems.</li>
          <li>Up-vote posts that helped you. Please don&apos;t down-vote posts you simply disagree with.</li>
          <li>Use your real name and photo. That is how your pod will recognise you.</li>
          <li>Be kind. The workshop depends on respect for one another.</li>
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
          <li>A stable internet connection is needed for live sessions. A slower connection is fine for the rest of the day.</li>
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
            <strong>VS Code</strong> (or any editor you prefer). Most labs ask you to edit
            small files.
          </li>
          <li>
            <strong>Python 3.11+</strong> for the labs that need it. We use Google Colab
            wherever possible, so installation problems do not stop you.
          </li>
          <li>
            <strong>Git</strong> for the few labs that include version-control practice.
          </li>
        </ul>
        <p>
          The first lesson includes a checklist that guides you through each item. Don&apos;t
          worry if something does not work on Day 1 — open a help-desk ticket and your
          faculty will help you set it up.
        </p>
      </>
    ),
  },
  {
    title: "Accounts you'll need",
    body: (
      <>
        <p>
          The workshop is designed to introduce you to several AI tools. You will compare
          ChatGPT, Claude, Gemini, and Grok side by side on Day 1 — noticing the
          differences in how each one behaves is part of the lesson. Set everything up on Day 0.
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
          OpenAI and Anthropic <strong>API keys</strong> are not required by default. A
          few labs let you use them if you already have credits. We always provide a
          Gemini or Hugging Face option, so cost is never a barrier.
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
          <li>Upload a profile photo — your pod and faculty will recognise you by it.</li>
          <li>
            Set your college or organisation. This is used to group people in the
            leaderboard and showcase.
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
            <strong>Morning:</strong> open today&apos;s lesson. Read it once, then start the
            lab.
          </li>
          <li>
            <strong>Mid-day:</strong> attend the live session, if scheduled. Small-group
            activities happen during the call.
          </li>
          <li>
            <strong>Afternoon:</strong> finish the lab, review it, and submit.
          </li>
          <li>
            <strong>Evening:</strong> answer one question on the community board. Take a
            short moment to reflect.
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
          <li>Join on time. The recording is not a replacement for joining live.</li>
          <li>Turn your camera on if you can. It helps the discussion and the small-group activities.</li>
          <li>Come with questions. The session is for you, not for the speaker.</li>
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
            <strong>Technical problem?</strong> Use the help desk and tag it as &ldquo;tech&rdquo;.
            It will be sent to staff automatically.
          </li>
          <li>
            <strong>Confused about a concept?</strong> Try the community board first —
            another student likely had the same question.
          </li>
          <li>
            <strong>Personal or sensitive?</strong> Message your faculty directly. Their
            contact is on the pod page.
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
          Three checkpoints — on days 6, 16, and 29 — gather your work into a piece you
          can present. Faculty review each milestone and give written feedback.
        </p>
        <ul>
          <li>M1 (day 6): your initial idea and a first draft prototype.</li>
          <li>M2 (day 16): a refined idea, with one working part of your project.</li>
          <li>M3 (day 29): your capstone, ready to present.</li>
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
            Your certificate is generated automatically on Day 30 if you meet the streak
            and capstone requirements.
          </li>
          <li>Your capstone is added to the showcase if you choose.</li>
          <li>
            Alumni office hours open four weeks later. You can sign up to mentor a new
            Day-1 student in the next cohort.
          </li>
        </ul>
        <HandbookAction href={ROUTES.certificate}>My certificate</HandbookAction>
        <HandbookAction href={ROUTES.showcase}>Showcase</HandbookAction>
      </>
    ),
  },
];
