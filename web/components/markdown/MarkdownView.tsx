import { MDXRemote, type MDXRemoteProps } from "next-mdx-remote/rsc";

const baseComponents: MDXRemoteProps["components"] = {
  h1: (p) => <h1 {...p} className="mt-8 mb-3 text-3xl font-semibold tracking-tight" />,
  h2: (p) => <h2 {...p} className="mt-6 mb-2 text-2xl font-semibold tracking-tight" />,
  h3: (p) => <h3 {...p} className="mt-4 mb-2 text-xl font-semibold tracking-tight" />,
  p:  (p) => <p {...p} className="text-ink/90 my-3 leading-7" />,
  a:  (p) => <a {...p} className="text-accent underline-offset-2 hover:underline" />,
  ul: (p) => <ul {...p} className="my-3 list-disc space-y-1.5 pl-6" />,
  ol: (p) => <ol {...p} className="my-3 list-decimal space-y-1.5 pl-6" />,
  li: (p) => <li {...p} className="text-ink/90" />,
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
    <blockquote {...p} className="border-accent text-muted my-4 border-l-2 pl-4 italic" />
  ),
  hr: (p) => <hr {...p} className="border-line my-6" />,
};

export function MarkdownView({ source }: { source: string }) {
  return (
    <article className="max-w-none">
      <MDXRemote source={source} components={baseComponents} />
    </article>
  );
}
