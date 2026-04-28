"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type FormEvent,
} from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { cn } from "@/lib/utils";

/**
 * Phase 6 — workshop concierge channel.
 *
 * Dispatch metaphor:
 *   - User messages are framed as TX (transmit), assistant as RX (receive).
 *   - Mono throughout for that "console" texture.
 *   - Citations render as bracket tags `[HBK·slug]` / `[D14]` so they read
 *     like channel codes, not generic links.
 *   - Composer is a single-line transmit prompt with a leading `›` glyph.
 *
 * Streams `{messages, route, clientMessageId, conversationId}` to
 * `/api/help-chat`. Token deltas append to the in-flight RX bubble.
 */

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
}

const RATE_LIMIT_COPY =
  "Daily transmission limit reached (30/day). Reach the help desk for anything urgent.";

export function AskAITab() {
  const pathname = usePathname() ?? "/";
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [rateLimited, setRateLimited] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages, streaming]);

  const send = useCallback(
    async (text: string) => {
      const trimmed = text.trim();
      if (!trimmed || streaming || rateLimited) return;
      setError(null);

      const userMsg: ChatMessage = { id: cryptoRandomId(), role: "user", content: trimmed };
      const assistantId = cryptoRandomId();
      const assistantStub: ChatMessage = { id: assistantId, role: "assistant", content: "" };
      const next = [...messages, userMsg];
      setMessages([...next, assistantStub]);
      setInput("");
      setStreaming(true);

      try {
        const res = await fetch("/api/help-chat", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            messages: next.map((m) => ({ role: m.role, content: m.content })),
            conversationId,
            route: pathname,
            clientMessageId: userMsg.id,
          }),
        });

        if (res.status === 429) {
          setRateLimited(true);
          setMessages((curr) => curr.filter((m) => m.id !== assistantId));
          return;
        }
        if (!res.ok || !res.body) {
          setError("Transmission failed. Try again in a moment.");
          setMessages((curr) => curr.filter((m) => m.id !== assistantId));
          return;
        }

        const newConvId = res.headers.get("x-help-chat-conversation-id");
        if (newConvId && !conversationId) setConversationId(newConvId);

        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let acc = "";
        for (;;) {
          const { value, done } = await reader.read();
          if (done) break;
          acc += decoder.decode(value, { stream: true });
          setMessages((curr) =>
            curr.map((m) => (m.id === assistantId ? { ...m, content: acc } : m)),
          );
        }
      } catch (err) {
        console.error("[help-chat client]", err);
        setError("Network down — check your connection.");
        setMessages((curr) => curr.filter((m) => m.id !== assistantId));
      } finally {
        setStreaming(false);
      }
    },
    [messages, conversationId, pathname, streaming, rateLimited],
  );

  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    void send(input);
  };

  return (
    <div className="bg-bg flex h-full min-h-0 flex-col">
      <div
        ref={scrollRef}
        className="flex-1 min-h-0 space-y-4 overflow-y-auto px-5 py-4 font-mono text-[12.5px] leading-[1.6]"
      >
        {messages.length === 0 && !rateLimited && <EmptyState />}
        {rateLimited && (
          <div className="border-warn/35 bg-warn/[0.05] text-ink/85 rounded-sm border-l-2 px-3 py-2.5 text-xs">
            <p className="text-warn font-semibold uppercase tracking-[0.18em] text-[10px] mb-1">
              ▲ Limit reached
            </p>
            <p className="font-sans">{RATE_LIMIT_COPY}</p>
          </div>
        )}
        {messages.map((m) => (
          <Transmission key={m.id} message={m} streaming={streaming} />
        ))}
        {error && (
          <div className="text-danger font-mono text-[11px] uppercase tracking-[0.18em]">
            ✕ {error}
          </div>
        )}
      </div>

      <form
        onSubmit={onSubmit}
        className="border-line bg-card/70 flex items-stretch border-t"
      >
        <span
          aria-hidden
          className="text-accent flex w-10 shrink-0 items-center justify-center font-mono text-base"
        >
          ›
        </span>
        <input
          value={input}
          onChange={(e) => setInput(e.currentTarget.value)}
          placeholder={
            rateLimited ? "Channel locked until tomorrow" : "Transmit a question…"
          }
          disabled={streaming || rateLimited}
          aria-label="Transmit a question to the workshop concierge"
          className="
            flex-1 bg-transparent px-1 py-3.5 outline-none
            text-ink placeholder:text-muted/65
            font-mono text-sm
            disabled:opacity-60
          "
        />
        <button
          type="submit"
          disabled={streaming || rateLimited || !input.trim()}
          className="
            border-line text-muted hover:text-ink hover:bg-bg-soft
            border-l flex w-16 shrink-0 items-center justify-center
            font-mono text-[10px] uppercase tracking-[0.22em]
            transition-colors
            disabled:opacity-40 disabled:hover:text-muted disabled:hover:bg-transparent disabled:cursor-not-allowed
          "
        >
          {streaming ? <span className="text-accent animate-pulse">···</span> : "Send"}
        </button>
      </form>
    </div>
  );
}

function EmptyState() {
  const examples = [
    "How do I grade a submission?",
    "What's on Day 7?",
    "Where do I see the at-risk roster?",
  ];
  return (
    <div className="font-sans">
      <p className="text-muted font-mono text-[10px] uppercase tracking-[0.22em] mb-3">
        ✦ Channel open
      </p>
      <p className="text-ink mb-1.5 text-sm font-medium">
        How can I help?
      </p>
      <p className="text-muted text-xs leading-relaxed">
        Pod questions, today&apos;s lab, grading, navigation. Replies cite the handbook
        section they came from.
      </p>
      <ul className="mt-4 space-y-1.5">
        {examples.map((ex) => (
          <li
            key={ex}
            className="
              text-ink/75 hover:text-ink hover:border-accent/40
              border-line flex items-center gap-2 border-l-2 px-3 py-1.5
              font-mono text-[11.5px]
              transition-colors
            "
          >
            <span className="text-accent/70 text-[10px]">›</span>
            <span>{ex}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function Transmission({
  message,
  streaming,
}: {
  message: ChatMessage;
  streaming: boolean;
}) {
  const isUser = message.role === "user";
  const showShimmer = !isUser && streaming && message.content.length === 0;
  const label = isUser ? "TX" : "RX";

  return (
    <div className="flex flex-col gap-1.5">
      <div
        className={cn(
          "flex items-center gap-2 text-[9.5px] uppercase tracking-[0.2em]",
          isUser ? "text-accent/80" : "text-muted/80",
        )}
      >
        <span
          className={cn(
            "h-1 w-1 rounded-full",
            isUser ? "bg-[hsl(var(--accent))]" : "bg-muted",
          )}
        />
        <span className="font-semibold">{label}</span>
        <span className="text-muted/40">·</span>
        <span className="text-muted/60">{isUser ? "you" : "workshop concierge"}</span>
      </div>
      <div
        className={cn(
          "border-l-2 pl-3 leading-[1.65]",
          isUser
            ? "text-ink border-accent/55"
            : "text-ink/90 border-line",
        )}
      >
        {showShimmer ? (
          <ShimmerLine />
        ) : (
          <RenderedText text={message.content} isUser={isUser} />
        )}
      </div>
    </div>
  );
}

function ShimmerLine() {
  return (
    <div className="flex items-center gap-1 py-1.5 font-mono text-[11px] tracking-[0.2em] text-muted/70">
      <span className="animate-pulse">▮</span>
      <span className="animate-pulse [animation-delay:120ms]">▮</span>
      <span className="animate-pulse [animation-delay:240ms]">▮</span>
    </div>
  );
}

/** Render assistant text with [handbook:slug] / [day-N] swapped to chips. */
function RenderedText({ text, isUser }: { text: string; isUser: boolean }) {
  const segments = useMemo(() => parseCitations(text), [text]);
  return (
    <div className="whitespace-pre-wrap break-words">
      {segments.map((seg, i) => {
        if (seg.type === "text") {
          return <span key={i}>{seg.value}</span>;
        }
        if (isUser) return <span key={i}>{seg.raw}</span>;
        return (
          <Link
            key={i}
            href={seg.href}
            className="
              text-accent hover:bg-accent/10 hover:border-accent/55
              border-accent/35 mx-0.5 inline-flex items-center gap-1
              border-l border-r px-1.5 align-baseline
              font-mono text-[10.5px] font-semibold uppercase tracking-[0.08em]
              transition-colors
            "
          >
            {seg.label}
          </Link>
        );
      })}
    </div>
  );
}

type Segment =
  | { type: "text"; value: string }
  | { type: "citation"; raw: string; label: string; href: string };

function parseCitations(text: string): Segment[] {
  const out: Segment[] = [];
  const re = /\[(handbook:[a-z0-9_\-#]+|day-\d+)\]/gi;
  let cursor = 0;
  let m: RegExpExecArray | null;
  while ((m = re.exec(text)) !== null) {
    if (m.index > cursor) out.push({ type: "text", value: text.slice(cursor, m.index) });
    const tag = m[1] ?? "";
    const raw = m[0];
    if (tag.startsWith("handbook:")) {
      const slug = tag.slice("handbook:".length).split("#")[0] ?? "";
      out.push({
        type: "citation",
        raw,
        label: `HBK·${slug.replace(/[_-]/g, " ").slice(0, 24)}`,
        href: hrefForHandbookSlug(slug),
      });
    } else {
      const n = tag.replace("day-", "");
      out.push({ type: "citation", raw, label: `D${n}`, href: `/day/${n}` });
    }
    cursor = m.index + raw.length;
  }
  if (cursor < text.length) out.push({ type: "text", value: text.slice(cursor) });
  return out;
}

function hrefForHandbookSlug(slug: string): string {
  if (slug.startsWith("admin-")) return "/admin/handbook";
  if (slug.startsWith("student-")) return "/handbook";
  return `/faculty/handbook#${slug}`;
}

function cryptoRandomId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}
