import { MDXRemote, type MDXRemoteProps } from "next-mdx-remote/rsc";
import remarkGfm from "remark-gfm";

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
        <li {...rest} className="text-ink/90 -ml-6 flex items-start gap-2 list-none">
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
    if ((p as React.InputHTMLAttributes<HTMLInputElement>).type === "checkbox") {
      return (
        <input
          {...(p as React.InputHTMLAttributes<HTMLInputElement>)}
          className="accent-[hsl(var(--accent))] mt-1.5 h-3.5 w-3.5"
          disabled
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

export function MarkdownView({ source }: { source: string }) {
  return (
    <article className="max-w-none">
      <MDXRemote
        source={source}
        components={baseComponents}
        options={{ mdxOptions: { remarkPlugins: [remarkGfm] } }}
      />
    </article>
  );
}
