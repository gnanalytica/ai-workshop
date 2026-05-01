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
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Persona } from "@/lib/auth/persona";

/**
 * Sage chat surface. Persona-aware starter prompts, warm labels, citations
 * rendered as inline chips that link into the handbook / day pages.
 *
 * Streams `{messages, route, clientMessageId, conversationId}` to
 * `/api/help-chat`; token deltas append to the in-flight assistant bubble.
 */

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
}

const RATE_LIMIT_COPY =
  "You've used today's 30 questions. Reach the help desk for anything urgent — Sage is back tomorrow.";

interface StarterPrompt {
  label: string;
  prompt: string;
}

const STARTERS_BY_PERSONA: Record<"student" | "faculty" | "admin", StarterPrompt[]> = {
  student: [
    { label: "What's today's lesson?", prompt: "What's on today's lesson? Walk me through it." },
    { label: "Where do I submit my assignment?", prompt: "Where do I find and submit today's assignment?" },
    { label: "How do I find my pod?", prompt: "How do I find my pod and see who else is in it?" },
    { label: "Where do I see my team?", prompt: "Where do I see my team and chat with them?" },
    { label: "How is my score calculated?", prompt: "How is my score / leaderboard rank calculated?" },
    { label: "I'm stuck — how do I get help?", prompt: "I'm stuck on a lab. What's the fastest way to get help?" },
    { label: "How do I join the live session?", prompt: "How do I join today's live session?" },
    { label: "Where is the handbook?", prompt: "Where can I find the student handbook for the platform?" },
  ],
  faculty: [
    { label: "What is a pod?", prompt: "What is a pod, and what's expected of me as the primary faculty?" },
    { label: "How do I create a pod?", prompt: "How do I create a pod and assign students to it?" },
    { label: "How do I review a submission?", prompt: "How do I review a student submission as faculty?" },
    { label: "How do I update the live link?", prompt: "How do I update today's live-session link for my cohort?" },
    { label: "Where is my pod's roster?", prompt: "Where do I see my pod's roster, attendance, and at-risk students?" },
    { label: "How do I escalate a help-desk ticket?", prompt: "How do I escalate a help-desk ticket to admin?" },
    { label: "How do I leave pod notes?", prompt: "How do I leave private pod notes about a student?" },
    { label: "What can I do in the demo cohort?", prompt: "What can I safely try in the sandbox / demo cohort?" },
  ],
  admin: [
    { label: "How do I create a cohort?", prompt: "How do I create a new cohort and seed the 30-day curriculum?" },
    { label: "How do I invite faculty?", prompt: "How do I invite a faculty member to a specific cohort?" },
    { label: "How do I unlock a day?", prompt: "How do I unlock or lock a specific day for a cohort?" },
    { label: "Where are cohort analytics?", prompt: "Where do I find cohort analytics and at-risk students?" },
    { label: "How do I assign pod faculty?", prompt: "How do I assign faculty to pods in a cohort?" },
    { label: "How do I run the help-desk queue?", prompt: "How do I triage the help-desk queue across cohorts?" },
  ],
};

export function AskAITab({ persona }: { persona: Persona | null }) {
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
          setError("Couldn't reach Sage just now. Try again in a moment.");
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
        setError("Network's down — check your connection.");
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

  const starters = STARTERS_BY_PERSONA[(persona ?? "student") as keyof typeof STARTERS_BY_PERSONA];

  return (
    <div className="bg-bg flex h-full min-h-0 flex-col">
      <div
        ref={scrollRef}
        className="flex-1 min-h-0 space-y-5 overflow-y-auto px-5 py-5 text-[13.5px] leading-[1.6]"
      >
        {messages.length === 0 && !rateLimited && (
          <EmptyState
            persona={persona}
            starters={starters}
            onPick={(p) => void send(p)}
            disabled={streaming}
          />
        )}
        {rateLimited && (
          <div className="border-warn/35 bg-warn/[0.05] text-ink/85 rounded-md border-l-2 px-3 py-2.5 text-[12.5px]">
            <p className="text-warn font-semibold uppercase tracking-[0.16em] text-[10px] mb-1">
              Daily limit reached
            </p>
            <p>{RATE_LIMIT_COPY}</p>
          </div>
        )}
        {messages.map((m) => (
          <Bubble key={m.id} message={m} streaming={streaming} />
        ))}
        {error && (
          <div className="text-danger text-[12px]">✕ {error}</div>
        )}
      </div>

      <form
        onSubmit={onSubmit}
        className="border-line bg-card/60 flex items-stretch border-t"
      >
        <input
          value={input}
          onChange={(e) => setInput(e.currentTarget.value)}
          placeholder={
            rateLimited ? "Sage is back tomorrow" : "Ask Sage anything…"
          }
          disabled={streaming || rateLimited}
          aria-label="Ask Sage a question"
          className="
            flex-1 bg-transparent px-4 py-3.5 outline-none
            text-ink placeholder:text-muted/65
            text-[14px]
            disabled:opacity-60
          "
        />
        <button
          type="submit"
          disabled={streaming || rateLimited || !input.trim()}
          aria-label="Send"
          className="
            border-line text-muted hover:text-ink hover:bg-bg-soft
            border-l flex w-14 shrink-0 items-center justify-center
            transition-colors
            disabled:opacity-40 disabled:hover:text-muted disabled:hover:bg-transparent disabled:cursor-not-allowed
          "
        >
          {streaming ? (
            <span className="text-accent animate-pulse text-base">···</span>
          ) : (
            <ArrowRight size={16} strokeWidth={2.2} />
          )}
        </button>
      </form>
    </div>
  );
}

function EmptyState({
  persona,
  starters,
  onPick,
  disabled,
}: {
  persona: Persona | null;
  starters: StarterPrompt[];
  onPick: (prompt: string) => void;
  disabled: boolean;
}) {
  const greeting =
    persona === "faculty"
      ? "Hi — I help with pods, grading, and platform how-tos."
      : persona === "admin"
        ? "Hi — I help with cohorts, invites, and analytics."
        : "Hi — I help with lessons, assignments, your pod, and getting around.";

  return (
    <div>
      <p className="text-ink mb-1 text-[15px] font-medium">Hello, I'm Sage.</p>
      <p className="text-muted mb-5 text-[12.5px] leading-relaxed">
        {greeting} Replies cite the handbook section they came from.
      </p>
      <p className="text-muted/85 mb-2 text-[10.5px] uppercase tracking-[0.18em]">
        Try one of these
      </p>
      <ul className="space-y-1.5">
        {starters.map((s) => (
          <li key={s.label}>
            <button
              type="button"
              disabled={disabled}
              onClick={() => onPick(s.prompt)}
              className="
                group w-full text-left
                border-line hover:border-accent/55 hover:bg-accent/5
                text-ink/85 hover:text-ink
                flex items-center justify-between gap-3
                rounded-md border px-3 py-2 text-[12.5px]
                transition-colors
                disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:border-line
              "
            >
              <span>{s.label}</span>
              <ArrowRight
                size={13}
                strokeWidth={2}
                className="text-muted/50 group-hover:text-accent shrink-0 transition-colors"
              />
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

function Bubble({
  message,
  streaming,
}: {
  message: ChatMessage;
  streaming: boolean;
}) {
  const isUser = message.role === "user";
  const showShimmer = !isUser && streaming && message.content.length === 0;
  const label = isUser ? "You" : "Sage";

  return (
    <div className="flex flex-col gap-1.5">
      <div
        className={cn(
          "flex items-center gap-2 text-[10.5px] uppercase tracking-[0.16em]",
          isUser ? "text-accent/90" : "text-muted/85",
        )}
      >
        <span
          className={cn(
            "h-1.5 w-1.5 rounded-full",
            isUser ? "bg-[hsl(var(--accent))]" : "bg-muted",
          )}
        />
        <span className="font-semibold">{label}</span>
      </div>
      <div
        className={cn(
          "border-l-2 pl-3 leading-[1.65]",
          isUser ? "text-ink border-accent/55" : "text-ink/90 border-line",
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
    <div className="flex items-center gap-1 py-1.5 text-muted/70 text-[13px]">
      <span className="animate-pulse">●</span>
      <span className="animate-pulse [animation-delay:140ms]">●</span>
      <span className="animate-pulse [animation-delay:280ms]">●</span>
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
              text-[11px] font-semibold uppercase tracking-[0.06em]
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
        label: `Handbook · ${slug.replace(/[_-]/g, " ").slice(0, 24)}`,
        href: hrefForHandbookSlug(slug),
      });
    } else {
      const n = tag.replace("day-", "");
      out.push({ type: "citation", raw, label: `Day ${n}`, href: `/day/${n}` });
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
