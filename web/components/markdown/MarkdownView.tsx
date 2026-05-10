import { MDXRemote, type MDXRemoteProps } from "next-mdx-remote/rsc";
import remarkGfm from "remark-gfm";
import { LabCheckbox } from "@/components/markdown/LabCheckbox";

export interface LabProgressCtx {
  cohortId: string;
  dayNumber: number;
  /** Stable scope segment so checkbox indices don't collide across phases. */
  scope: string;
  /** lab_ids the user already marked done. */
  doneLabIds: ReadonlySet<string>;
}

const baseComponents: MDXRemoteProps["components"] = {
  h1: (p) => <h1 {...p} className="mt-8 mb-3 text-3xl font-semibold tracking-tight" />,
  h2: (p) => <h2 {...p} className="mt-6 mb-2 text-2xl font-semibold tracking-tight" />,
  h3: (p) => <h3 {...p} className="mt-4 mb-2 text-xl font-semibold tracking-tight" />,
  h4: (p) => <h4 {...p} className="mt-4 mb-2 text-lg font-semibold tracking-tight" />,
  p: (p) => <p {...p} className="text-ink/90 my-3 leading-7" />,
  a: (p) => <a {...p} className="text-accent underline-offset-2 hover:underline" />,
  strong: (p) => <strong {...p} className="text-ink font-semibold" />,
  em: (p) => <em {...p} className="text-ink/95" />,
  ul: (p) => <ul {...p} className="my-3 list-disc space-y-1.5 pl-6" />,
  ol: (p) => <ol {...p} className="my-3 list-decimal space-y-1.5 pl-6" />,
  li: (props) => {
    // GFM task-list items render with className="task-list-item" + a checkbox child
    const { className, children, ...rest } = props as React.LiHTMLAttributes<HTMLLIElement>;
    if (className?.includes("task-list-item")) {
      return (
        <li
          {...rest}
          className="text-ink/90 -ml-6 flex items-start gap-2 list-none transition-opacity has-[input:checked]:text-muted has-[input:checked]:opacity-70 has-[input:checked]:line-through has-[input:checked]:decoration-muted/50"
        >
          {children}
        </li>
      );
    }
    return (
      <li {...rest} className="text-ink/90">
        {children}
      </li>
    );
  },
  input: (p) => {
    const props = p as React.InputHTMLAttributes<HTMLInputElement>;
    if (props.type === "checkbox") {
      // GFM emits `checked` (controlled). Convert to defaultChecked so the
      // browser owns the state and the box is interactive without React
      // warnings or wiring up a state handler per item.
      const { checked, defaultChecked, ...rest } = props;
      return (
        <input
          {...rest}
          type="checkbox"
          defaultChecked={defaultChecked ?? checked ?? false}
          className="mt-1 h-[1.125rem] w-[1.125rem] shrink-0 cursor-pointer rounded border-2 border-line accent-[hsl(var(--accent))] transition-all hover:border-accent hover:shadow-[0_0_0_3px_hsl(var(--accent)/0.15)]"
        />
      );
    }
    return <input {...p} />;
  },
  code: (p) => (
    <code
      {...p}
      className="bg-bg-soft border-line rounded border px-1.5 py-0.5 font-mono text-[0.85em]"
    />
  ),
  pre: (p) => (
    <pre
      {...p}
      className="bg-bg-soft border-line my-4 overflow-x-auto rounded-md border p-4 font-mono text-xs"
    />
  ),
  blockquote: (p) => (
    <blockquote
      {...p}
      className="border-accent text-muted my-4 border-l-2 pl-4 italic"
    />
  ),
  hr: (p) => <hr {...p} className="border-line my-6" />,
  table: (p) => (
    <div className="my-4 overflow-x-auto">
      <table {...p} className="border-line w-full border-collapse text-sm" />
    </div>
  ),
  thead: (p) => <thead {...p} className="bg-bg-soft" />,
  th: (p) => (
    <th
      {...p}
      className="border-line text-muted border px-3 py-2 text-left text-xs font-semibold tracking-wide uppercase"
    />
  ),
  td: (p) => (
    <td
      {...p}
      className="border-line text-ink/90 border px-3 py-2 align-top leading-6"
    />
  ),
  del: (p) => <del {...p} className="text-muted line-through" />,
};

/** Long-form modules (e.g. faculty handbook): sectioned typography, calmer list rhythm */
const handbookComponents: MDXRemoteProps["components"] = {
  ...baseComponents,
  h1: (p) => (
    <h1
      {...p}
      className="font-display text-ink mt-10 mb-4 border-b border-hairline pb-3 text-2xl font-semibold tracking-tight [font-variation-settings:'opsz'60] first:mt-0"
    />
  ),
  h2: (p) => (
    <h2
      {...p}
      className="font-display text-ink/95 mt-10 mb-3 border-l-2 border-accent/70 pl-4 text-[1.35rem] font-semibold leading-snug tracking-tight [font-variation-settings:'opsz'56] first:mt-0"
    />
  ),
  h3: (p) => (
    <h3 {...p} className="text-ink/95 mt-8 mb-2 text-base font-semibold leading-snug tracking-tight" />
  ),
  h4: (p) => <h4 {...p} className="text-ink/90 mt-5 mb-1.5 text-sm font-semibold uppercase tracking-wider" />,
  p: (p) => <p {...p} className="text-ink/88 my-3.5 text-[0.95rem] leading-7" />,
  ul: (p) => <ul {...p} className="my-4 list-disc space-y-2.5 pl-5 marker:text-accent" />,
  ol: (p) => <ol {...p} className="my-4 list-decimal space-y-2.5 pl-5 marker:font-mono marker:text-sm marker:text-muted" />,
  li: (props) => {
    const { className, children, ...rest } = props as React.LiHTMLAttributes<HTMLLIElement>;
    if (className?.includes("task-list-item")) {
      return (
        <li
          {...rest}
          className="border-line/60 bg-bg-soft/50 text-ink/90 -ml-1 flex list-none items-start gap-2.5 rounded-r-md border border-l-2 border-l-accent/40 pl-3 py-2.5 transition-all has-[input:checked]:bg-accent/5 has-[input:checked]:border-l-accent has-[input:checked]:text-muted has-[input:checked]:line-through has-[input:checked]:decoration-muted/40"
        >
          {children}
        </li>
      );
    }
    return (
      <li {...rest} className="text-ink/90 pl-0.5 leading-7 [text-wrap:pretty]">
        {children}
      </li>
    );
  },
  blockquote: (p) => (
    <blockquote
      {...p}
      className="text-muted my-5 border-l-2 border-accent/35 bg-gradient-to-r from-bg-soft/90 to-transparent py-1.5 pl-4 text-sm italic leading-7"
    />
  ),
  hr: (p) => (
    <hr
      {...p}
      className="my-10 h-px border-0 bg-gradient-to-r from-transparent via-line/50 to-transparent"
    />
  ),
  strong: (p) => <strong {...p} className="text-ink font-semibold" />,
  a: (p) => (
    <a {...p} className="text-accent [text-underline-offset:3px] decoration-accent/30 hover:decoration-accent" />
  ),
};

export function MarkdownView({
  source,
  variant = "default",
  className = "",
  progressCtx,
}: {
  source: string;
  variant?: "default" | "handbook";
  className?: string;
  /** When provided, GFM task-list checkboxes persist to lab_progress. */
  progressCtx?: LabProgressCtx;
}) {
  const baseSet = variant === "handbook" ? handbookComponents : baseComponents;
  const components: MDXRemoteProps["components"] = progressCtx
    ? withLabProgress(baseSet, progressCtx)
    : baseSet;
  return (
    <article
      className={
        variant === "handbook" ? `handbook-prose max-w-none ${className}`.trim() : `max-w-none ${className}`.trim()
      }
    >
      <MDXRemote
        source={source}
        components={components}
        options={{ mdxOptions: { remarkPlugins: [remarkGfm] } }}
      />
    </article>
  );
}

/**
 * Replace the `input` override with one that emits a persistent LabCheckbox
 * for each GFM task-list checkbox. Indices are scoped per render so the
 * same lab_id is generated for the same checkbox on every re-render.
 */
function withLabProgress(
  base: MDXRemoteProps["components"],
  ctx: LabProgressCtx,
): MDXRemoteProps["components"] {
  let i = 0;
  return {
    ...base,
    input: (p) => {
      const props = p as React.InputHTMLAttributes<HTMLInputElement>;
      if (props.type !== "checkbox") return <input {...p} />;
      const labId = `${ctx.scope}-${i++}`;
      const done = props.checked ?? props.defaultChecked ?? ctx.doneLabIds.has(labId);
      return (
        <LabCheckbox
          cohortId={ctx.cohortId}
          dayNumber={ctx.dayNumber}
          labId={labId}
          initialDone={done}
        />
      );
    },
  };
}
