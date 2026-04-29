import { requireCapability } from "@/lib/auth/requireCapability";
import {
  StaticHandbook,
  parseHandbookTab,
  type HandbookSection,
} from "@/components/handbook/StaticHandbook";
import { HandbookAction } from "@/components/handbook/HandbookAction";
import { ROUTES } from "@/lib/routes";

export default async function AdminHandbookPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  await requireCapability("orgs.write");
  const sp = await searchParams;
  return (
    <StaticHandbook
      persona="admin"
      eyebrow="Admin reference"
      title="Operating playbook"
      intro="Lifecycle, security, and common runbooks. The Dashboard navigation tab launches an interactive guide through every screen — useful when onboarding a peer admin."
      tab={parseHandbookTab(sp.tab)}
      yourRole={YOUR_ROLE}
      setup={SETUP}
      dayByDay={DAY_BY_DAY}
    />
  );
}

const YOUR_ROLE: HandbookSection[] = [
  {
    title: "What admin owns",
    body: (
      <>
        <p>
          Admins are the only persona that can change roles, issue invite codes, and edit
          the cohort schedule. You&apos;re the system&apos;s root of trust.
        </p>
        <ul>
          <li>Issue and revoke invite codes for every persona.</li>
          <li>Create cohorts; flip them between draft, live, and archived.</li>
          <li>Configure days, live-session times, and curriculum unlocks.</li>
          <li>Resolve escalated help-desk tickets (tech and policy).</li>
          <li>Run roster, attendance, and at-risk analytics.</li>
        </ul>
      </>
    ),
  },
  {
    title: "Three personas, no overlap",
    body: (
      <>
        <p>
          The system enforces persona separation in the database. Don&apos;t try to fight
          it — bend the workflow instead.
        </p>
        <ul>
          <li>
            <strong>Admin</strong> — global staff role.
          </li>
          <li>
            <strong>Faculty</strong> — assigned to one or more cohorts.
          </li>
          <li>
            <strong>Student</strong> — confirmed registration in a single cohort.
          </li>
        </ul>
        <p>
          A user with a confirmed registration can&apos;t be promoted to admin without
          first cancelling that registration. Same the other way.
        </p>
      </>
    ),
  },
  {
    title: "First admin bootstrap",
    body: (
      <>
        <p>
          The very first admin can&apos;t self-promote. Bootstrap process:
        </p>
        <ul>
          <li>The new admin signs in once via magic link to create a profile row.</li>
          <li>
            In Supabase Studio, run:{" "}
            <code>
              update profiles set staff_roles = array[&apos;admin&apos;] where email = &apos;…&apos;;
            </code>
          </li>
          <li>
            They sign back in — <code>resolveHome</code> routes them to <code>/admin</code>.
          </li>
        </ul>
        <p>
          Subsequent admins are promoted via staff invite codes, not SQL. Always keep at
          least two admins; if you lock yourself out, only the SQL bootstrap recovers it.
        </p>
      </>
    ),
  },
  {
    title: "Security checklist",
    body: (
      <>
        <ul>
          <li>Two admins minimum at all times.</li>
          <li>
            Service-role keys never touch client code. Only{" "}
            <code>NEXT_PUBLIC_SUPABASE_*</code> env vars reach the browser.
          </li>
          <li>
            Review <code>SECURITY DEFINER</code> functions and RLS policies after any
            migration that touches <code>auth_caps</code>, <code>can_grade</code>, or
            profile policies.
          </li>
          <li>
            Run <code>supabase/tests/rbac.sql</code> after any role/policy change. CI does
            it automatically; you can run it locally before pushing.
          </li>
          <li>Rate limits are applied to sign-up and magic-link endpoints.</li>
        </ul>
      </>
    ),
  },
];

const SETUP: HandbookSection[] = [
  {
    title: "What you need locally",
    body: (
      <>
        <p>Admins do most work in the browser, but a few things help:</p>
        <ul>
          <li>
            <strong>Supabase dashboard access</strong> — for SQL editor (bootstrap, audit)
            and storage (avatars, attachments).
          </li>
          <li>
            <strong>Supabase service-role key</strong> stored in a password manager, never
            in chat. Required only for the rare break-glass bootstrap step.
          </li>
          <li>
            <strong>Vercel dashboard access</strong> — to monitor deployments and read logs.
          </li>
          <li>
            <strong>GitHub repo access</strong> — for reviewing migrations and curriculum
            edits before they ship.
          </li>
        </ul>
      </>
    ),
  },
  {
    title: "Optional power tools",
    body: (
      <>
        <ul>
          <li>
            <strong>psql</strong> on your laptop, pointed at the Supabase connection
            string. Useful for one-off queries that are awkward in the dashboard editor.
          </li>
          <li>
            <strong>Supabase CLI</strong> — only needed if you&apos;re editing migrations
            locally. Most admins don&apos;t need this.
          </li>
          <li>
            <strong>1Password / similar</strong> for shared secrets (service-role key, SMTP
            credentials).
          </li>
        </ul>
      </>
    ),
  },
  {
    title: "Accounts you'll likely create",
    body: (
      <>
        <ul>
          <li>
            A separate workshop email address (e.g. <code>workshop@yourorg</code>) that
            owns the Resend / Supabase / Vercel accounts. Don&apos;t tie production to a
            personal email.
          </li>
          <li>
            Resend domain verification + a sender address for transactional email.
          </li>
          <li>
            Custom domain in Vercel + DNS records.
          </li>
        </ul>
      </>
    ),
  },
];

const DAY_BY_DAY: HandbookSection[] = [
  {
    title: "Cohort lifecycle",
    body: (
      <>
        <p>
          A cohort moves through <strong>draft → live → archived</strong>.
        </p>
        <ul>
          <li>Create the cohort row, set start/end dates, seed days.</li>
          <li>Issue invite codes — see the action below.</li>
          <li>
            Once enrolment hits target, flip status to <code>live</code>; the daily-digest
            cron starts firing.
          </li>
          <li>
            After day 30, archive. Data is preserved; students keep certificate-download
            access.
          </li>
        </ul>
        <HandbookAction href={ROUTES.adminCohorts}>Manage cohorts</HandbookAction>
        <HandbookAction href={ROUTES.adminInvites}>Issue invites</HandbookAction>
      </>
    ),
  },
  {
    title: "Inviting people",
    body: (
      <>
        <ul>
          <li>
            Student codes (<code>STU-…</code>) — set <code>max_uses</code> for bulk invites
            or generate unique codes per student.
          </li>
          <li>Faculty codes (<code>FAC-…</code>) — scoped to one cohort.</li>
          <li>
            Staff codes (<code>ADM-…</code>, <code>TRA-…</code>, <code>TEC-…</code>) — grant
            global staff roles. Hand out sparingly, single-use.
          </li>
        </ul>
        <p>
          Recipients paste the code on the public sign-up page; the system auto-detects
          role from kind. Code validation runs live as they type.
        </p>
        <HandbookAction href={ROUTES.adminInvites}>Open invites</HandbookAction>
        <HandbookAction href={ROUTES.signUp}>Public sign-up</HandbookAction>
      </>
    ),
  },
  {
    title: "Pods & faculty assignment",
    body: (
      <>
        <p>
          Pods are the unit of student-faculty interaction. Manage them on the pods page
          or via the cohort kanban.
        </p>
        <ul>
          <li>Recommended: 5–8 students per pod, 1–2 faculty per pod.</li>
          <li>
            Drag students between pods, or use list view for bulk reassign. Drag faculty
            chips to add/remove.
          </li>
          <li>
            Faculty in a pod have <code>grading.write:pod</code> for that pod&apos;s
            students plus <code>community.write</code> + <code>moderation.write</code> for
            the cohort.
          </li>
        </ul>
        <HandbookAction href={ROUTES.adminPods}>Manage pods</HandbookAction>
      </>
    ),
  },
  {
    title: "Roster & at-risk monitoring",
    body: (
      <>
        <p>
          The roster view shows every student with progress, last activity, and signal
          badges.
        </p>
        <ul>
          <li>
            Signals: <code>no_activity</code> (3d+ idle), <code>no_submissions</code>,{" "}
            <code>low_labs</code>, <code>open_help</code>.
          </li>
          <li>
            Click into a student for the full drawer: submissions, help-desk tickets, pod
            history, faculty notes.
          </li>
          <li>
            Use impersonation (eye icon, top bar) to see exactly what a student or faculty
            sees. Read-only.
          </li>
        </ul>
        <HandbookAction href={ROUTES.adminRoster}>Open roster</HandbookAction>
      </>
    ),
  },
  {
    title: "Schedule & curriculum",
    body: (
      <>
        <ul>
          <li>
            Edit copy by editing <code>web/content/day-XX.mdx</code> and pushing — Vercel
            rebuilds, no migration needed.
          </li>
          <li>Edit dates / live-session times in the schedule view.</li>
          <li>
            Days unlock automatically at start-of-day in the cohort timezone. Force-unlock
            for review by toggling <code>cohort_days.is_unlocked</code>.
          </li>
        </ul>
        <HandbookAction href={ROUTES.adminSchedule}>Open schedule</HandbookAction>
      </>
    ),
  },
  {
    title: "Support escalation",
    body: (
      <>
        <p>
          Pod faculty triage help-desk tickets first. If they hit{" "}
          <code>support.escalate</code>, the ticket lands in the admin queue.
        </p>
        <ul>
          <li>Tech-tagged tickets are admin-only end-to-end.</li>
          <li>
            See live load on the admin home dashboard — drill in via the &quot;help desk
            open&quot; tile.
          </li>
        </ul>
      </>
    ),
  },
];
