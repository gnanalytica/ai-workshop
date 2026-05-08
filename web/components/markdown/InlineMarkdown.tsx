"use client";

import { Fragment, type ReactNode } from "react";

/**
 * Tiny client-side markdown renderer for short bits of content stored in the DB
 * (assignment body_md, feedback_md). Supports the subset we actually use:
 * `##`/`###` headings, `**bold**`, `*italic*`, `[label](url)`, ordered/unordered
 * lists, and blank-line paragraph breaks. For full MDX rendering use the RSC
 * `MarkdownView` instead.
 */
export function InlineMarkdown({
  source,
  className,
}: {
  source: string;
  className?: string;
}) {
  const blocks = parseBlocks(source.trim());
  return (
    <div className={className}>
      {blocks.map((b, i) => (
        <Fragment key={i}>{renderBlock(b)}</Fragment>
      ))}
    </div>
  );
}

type Block =
  | { kind: "h2" | "h3"; text: string }
  | { kind: "ul" | "ol"; items: string[] }
  | { kind: "p"; text: string };

function parseBlocks(src: string): Block[] {
  const lines = src.split("\n");
  const out: Block[] = [];
  let i = 0;
  while (i < lines.length) {
    const line = lines[i] ?? "";
    if (!line.trim()) {
      i++;
      continue;
    }
    if (line.startsWith("### ")) {
      out.push({ kind: "h3", text: line.slice(4).trim() });
      i++;
      continue;
    }
    if (line.startsWith("## ")) {
      out.push({ kind: "h2", text: line.slice(3).trim() });
      i++;
      continue;
    }
    if (/^\s*[-*]\s+/.test(line)) {
      const items: string[] = [];
      while (i < lines.length && /^\s*[-*]\s+/.test(lines[i] ?? "")) {
        items.push((lines[i] ?? "").replace(/^\s*[-*]\s+/, ""));
        i++;
      }
      out.push({ kind: "ul", items });
      continue;
    }
    if (/^\s*\d+\.\s+/.test(line)) {
      const items: string[] = [];
      while (i < lines.length && /^\s*\d+\.\s+/.test(lines[i] ?? "")) {
        items.push((lines[i] ?? "").replace(/^\s*\d+\.\s+/, ""));
        i++;
      }
      out.push({ kind: "ol", items });
      continue;
    }
    const buf: string[] = [];
    while (
      i < lines.length &&
      (lines[i] ?? "").trim() &&
      !/^(#{2,3}\s|\s*[-*]\s+|\s*\d+\.\s+)/.test(lines[i] ?? "")
    ) {
      buf.push(lines[i] ?? "");
      i++;
    }
    out.push({ kind: "p", text: buf.join(" ") });
  }
  return out;
}

function renderBlock(b: Block): ReactNode {
  if (b.kind === "h2") {
    return (
      <h3 className="text-ink mt-4 mb-2 text-base font-semibold tracking-tight">
        {renderInline(b.text)}
      </h3>
    );
  }
  if (b.kind === "h3") {
    return (
      <h4 className="text-ink mt-3 mb-1.5 text-sm font-semibold tracking-tight">
        {renderInline(b.text)}
      </h4>
    );
  }
  if (b.kind === "ul") {
    return (
      <ul className="text-ink/90 my-2 list-disc space-y-1 pl-5 text-sm leading-6">
        {b.items.map((it, i) => (
          <li key={i}>{renderInline(it)}</li>
        ))}
      </ul>
    );
  }
  if (b.kind === "ol") {
    return (
      <ol className="text-ink/90 my-2 list-decimal space-y-1 pl-5 text-sm leading-6">
        {b.items.map((it, i) => (
          <li key={i}>{renderInline(it)}</li>
        ))}
      </ol>
    );
  }
  if (b.kind === "p") {
    return (
      <p className="text-ink/90 my-2 text-sm leading-6">{renderInline(b.text)}</p>
    );
  }
  return null;
}

// Inline tokens: bold (**), italic (*), links [label](url). Lightweight tokenizer
// that walks the string once and emits React nodes — no nested formatting.
function renderInline(text: string): ReactNode {
  const nodes: ReactNode[] = [];
  let i = 0;
  let key = 0;
  while (i < text.length) {
    const rest = text.slice(i);

    const link = /^\[([^\]]+)\]\(([^)]+)\)/.exec(rest);
    if (link) {
      nodes.push(
        <a
          key={key++}
          href={link[2]}
          target="_blank"
          rel="noreferrer"
          className="text-accent underline-offset-2 hover:underline"
        >
          {link[1]}
        </a>,
      );
      i += link[0].length;
      continue;
    }

    if (rest.startsWith("**")) {
      const end = rest.indexOf("**", 2);
      if (end > 2) {
        nodes.push(
          <strong key={key++} className="text-ink font-semibold">
            {rest.slice(2, end)}
          </strong>,
        );
        i += end + 2;
        continue;
      }
    }

    if (rest.startsWith("*") && !rest.startsWith("**")) {
      const end = rest.indexOf("*", 1);
      if (end > 1) {
        nodes.push(
          <em key={key++} className="text-ink/95">
            {rest.slice(1, end)}
          </em>,
        );
        i += end + 1;
        continue;
      }
    }

    nodes.push(text[i]);
    i++;
  }
  return nodes;
}
