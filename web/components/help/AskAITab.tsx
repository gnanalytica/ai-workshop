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
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

/**
 * Phase 6 — in-product help chat.
 *
 * Lightweight custom transport that posts `{messages, route, clientMessageId,
 * conversationId}` to `/api/help-chat`, then streams the response body as raw
 * text deltas (the route uses `streamText().toTextStreamResponse()`). When
 * `@ai-sdk/react` lands, we can swap this for `useChat` without touching the
 * server route.
 */

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
}

const RATE_LIMIT_COPY = "You've hit today's chat limit (30 messages/day). Open the help desk for anything urgent.";

export function AskAITab() {
  const pathname = usePathname() ?? "/";
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [rateLimited, setRateLimited] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement | null>(null);

  // auto-scroll on new messages / new tokens
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
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
          setError("Something went wrong. Try again in a moment.");
          setMessages((curr) => curr.filter((m) => m.id !== assistantId));
          return;
        }

        const newConvId = res.headers.get("x-help-chat-conversation-id");
        if (newConvId && !conversationId) setConversationId(newConvId);

        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let acc = "";
        // Stream tokens into the placeholder assistant message.
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
        setError("Network error. Check your connection and try again.");
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
    <div className="flex h-full min-h-0 flex-col">
      <div
        ref={scrollRef}
        className="flex-1 min-h-0 space-y-3 overflow-y-auto px-4 py-3"
      >
        {messages.length === 0 && !rateLimited && (
          <EmptyState />
        )}
        {rateLimited && (
          <div className="border-line bg-bg-soft text-ink/85 rounded-md border p-4 text-sm">
            {RATE_LIMIT_COPY}
          </div>
        )}
        {messages.map((m) => (
          <MessageBubble key={m.id} message={m} streaming={streaming} />
        ))}
        {error && (
          <div className="text-danger text-xs">{error}</div>
        )}
      </div>

      <form
        onSubmit={onSubmit}
        className="border-line bg-card flex items-center gap-2 border-t p-3"
      >
        <Input
          value={input}
          onChange={(e) => setInput(e.currentTarget.value)}
          placeholder={rateLimited ? "Limit reached for today" : "Ask anything about the workshop…"}
          disabled={streaming || rateLimited}
          aria-label="Ask the help assistant"
        />
        <Button type="submit" disabled={streaming || rateLimited || !input.trim()}>
          {streaming ? "…" : "Send"}
        </Button>
      </form>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="text-muted px-1 py-6 text-sm">
      <p className="text-ink mb-2 font-medium">Ask the help assistant</p>
      <p>
        Questions about your pod, today&apos;s lab, grading, or how something on this
        screen works — start typing below. The answer will cite the handbook section
        it came from.
      </p>
    </div>
  );
}

function MessageBubble({ message, streaming }: { message: ChatMessage; streaming: boolean }) {
  const isUser = message.role === "user";
  const showShimmer = !isUser && streaming && message.content.length === 0;

  return (
    <div className={cn("flex w-full", isUser ? "justify-end" : "justify-start")}>
      <div
        className={cn(
          "max-w-[88%] rounded-2xl border px-3.5 py-2.5 text-sm leading-6",
          isUser
            ? "bg-accent/10 border-accent/30 text-ink"
            : "bg-card border-line text-ink/90",
        )}
      >
        {showShimmer ? (
          <ShimmerLine />
        ) : (
          <RenderedAssistantText text={message.content} isUser={isUser} />
        )}
      </div>
    </div>
  );
}

function ShimmerLine() {
  return (
    <div className="flex items-center gap-1.5 py-1">
      <span className="bg-muted/60 h-1.5 w-1.5 animate-pulse rounded-full" />
      <span className="bg-muted/60 h-1.5 w-1.5 animate-pulse rounded-full [animation-delay:120ms]" />
      <span className="bg-muted/60 h-1.5 w-1.5 animate-pulse rounded-full [animation-delay:240ms]" />
    </div>
  );
}

/**
 * Render assistant text with [handbook:slug] and [day-N] tags swapped for
 * linkified chips. User text is rendered as plain text. We deliberately keep
 * markdown rendering minimal here — just paragraph splits + citation chips —
 * because the prompt asks for short responses.
 */
function RenderedAssistantText({ text, isUser }: { text: string; isUser: boolean }) {
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
            className="bg-accent/10 text-accent border-accent/30 mx-0.5 inline-flex items-center rounded border px-1.5 py-0 align-baseline text-[0.78em] font-medium hover:bg-accent/20"
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
  // Match [handbook:some-slug] or [day-12]
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
        label: slug.replace(/[_-]/g, " "),
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
  // Faculty handbook modules use their slug as an id-like anchor.
  return `/faculty/handbook#${slug}`;
}

function cryptoRandomId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}
