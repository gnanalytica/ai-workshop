import { NextResponse } from "next/server";
import { stepCountIs, streamText, tool } from "ai";
import { z } from "zod";
import { getSupabaseServer } from "@/lib/supabase/server";
import { getSupabaseService } from "@/lib/supabase/service";
import { getEffectivePersona } from "@/lib/auth/persona";
import { getMyCurrentCohort, todayDayNumber } from "@/lib/queries/cohort";
import { getMyPod } from "@/lib/queries/pod";
import { getDayInteractive } from "@/lib/queries/day-interactive";
import { retrieveHelp } from "@/lib/ai/help-retrieval";
import {
  buildHelpSystemPrompt,
  helpChatModel,
  HELP_CHAT_MODEL_ID,
} from "@/lib/ai/help-chat";

// Payload guardrails — defense against accidental huge pastes and
// runaway token bills. The daily-cap rate limit (rpc_help_chat_increment)
// already covers per-user volume; these caps are for per-request size.
const MAX_MESSAGES = 50;
const MAX_SINGLE_MESSAGE_CHARS = 10_000;
const MAX_TOTAL_CHARS = 30_000;

export const runtime = "nodejs";
// streamText must run on a long-lived response — disable static caching.
export const dynamic = "force-dynamic";

interface ClientMessage {
  role: "user" | "assistant";
  content: string;
}

interface PostBody {
  messages: ClientMessage[];
  conversationId?: string;
  route: string;
  clientMessageId: string;
}

export async function POST(req: Request) {
  // ---- auth ---------------------------------------------------------------
  const sb = await getSupabaseServer();
  const { data: userRes } = await sb.auth.getUser();
  const user = userRes?.user;
  if (!user) {
    return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });
  }

  // ---- body ---------------------------------------------------------------
  let body: PostBody;
  try {
    body = (await req.json()) as PostBody;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const { messages, route, clientMessageId } = body;
  let { conversationId } = body;
  if (!Array.isArray(messages) || messages.length === 0 || !route || !clientMessageId) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }
  if (messages.length > MAX_MESSAGES) {
    return NextResponse.json(
      { error: `Conversation too long (${messages.length} messages > ${MAX_MESSAGES})` },
      { status: 413 },
    );
  }
  let total = 0;
  for (const m of messages) {
    const len = (m?.content ?? "").length;
    if (len > MAX_SINGLE_MESSAGE_CHARS) {
      return NextResponse.json(
        { error: `Message too long (${len} chars > ${MAX_SINGLE_MESSAGE_CHARS})` },
        { status: 413 },
      );
    }
    total += len;
  }
  if (total > MAX_TOTAL_CHARS) {
    return NextResponse.json(
      { error: `Conversation too long (${total} chars > ${MAX_TOTAL_CHARS})` },
      { status: 413 },
    );
  }

  // ---- persona + cohort ---------------------------------------------------
  const persona = (await getEffectivePersona()) ?? "student";
  const cohort = await getMyCurrentCohort();

  // ---- rate-limit (admins exempt inside the RPC) --------------------------
  const { data: allowed, error: rlErr } = await sb.rpc("rpc_help_chat_increment", {
    p_user_id: user.id,
  } as never);
  if (rlErr) {
    console.error("[help-chat] rate-limit rpc failed", rlErr);
    return NextResponse.json({ error: "Rate limit check failed" }, { status: 500 });
  }
  if (allowed === false) {
    return NextResponse.json(
      { error: "Daily limit reached", code: "rate_limited" },
      { status: 429 },
    );
  }

  // ---- conversation -------------------------------------------------------
  const svc = getSupabaseService();
  if (!conversationId) {
    const { data, error } = await svc
      .from("help_chat_conversations")
      .insert({
        user_id: user.id,
        persona,
        route_at_start: route,
      } as never)
      .select("id")
      .single();
    if (error || !data) {
      console.error("[help-chat] conversation insert failed", error);
      return NextResponse.json({ error: "Could not start conversation" }, { status: 500 });
    }
    conversationId = (data as { id: string }).id;
  }

  // ---- last user message --------------------------------------------------
  const lastUser = [...messages].reverse().find((m) => m.role === "user");
  const userText = lastUser?.content?.trim() ?? "";

  // Persist the user message (deduped via client_message_id unique).
  if (userText) {
    const { error: msgErr } = await svc.from("help_chat_messages").insert({
      conversation_id: conversationId,
      role: "user",
      content: userText,
      client_message_id: clientMessageId,
    } as never);
    if (msgErr && !String(msgErr.message ?? "").toLowerCase().includes("duplicate")) {
      console.error("[help-chat] user message insert failed", msgErr);
    }
  }

  // ---- retrieve context ---------------------------------------------------
  const context = await retrieveHelp(userText || "", persona, 5);
  const system = buildHelpSystemPrompt({
    persona,
    route,
    cohortName: cohort?.name ?? null,
    context,
  });

  // ---- tools (read-only, scoped to caller) -------------------------------
  // Only students get getMyContext — admins/faculty have richer admin pages
  // and shouldn't lean on chat tools to look up student data. Tool runs in
  // the caller's session so RLS naturally gates everything it touches.
  const tools =
    persona === "student" && cohort
      ? {
          getMyContext: tool({
            description:
              "Look up the current student's live workshop context: cohort name, today's day number, their pod name + assigned faculty, and whether they have a pending assignment or quiz for today. Use this when the student asks about their own data — 'what's pending today', 'who's my pod faculty', 'how am I doing' — but NOT for general 'how do I X' / navigation questions.",
            inputSchema: z.object({}),
            execute: async () => {
              const dayNumber = todayDayNumber(cohort);
              const [pod, interactive] = await Promise.all([
                getMyPod(cohort.id).catch(() => null),
                getDayInteractive(cohort.id, dayNumber).catch(() => null),
              ]);
              const facultyNames =
                pod?.faculty
                  .map((f) => f.full_name)
                  .filter((n): n is string => !!n)
                  .join(", ") || null;
              const assignmentStatus =
                interactive?.assignment?.submission?.status ?? null;
              return {
                cohortName: cohort.name,
                dayNumber,
                podName: pod?.pod_name ?? null,
                podFaculty: facultyNames,
                todaysAssignment: interactive?.assignment
                  ? {
                      title: interactive.assignment.title,
                      status: assignmentStatus ?? "not started",
                    }
                  : null,
                todaysQuiz: interactive?.quiz
                  ? {
                      title: interactive.quiz.title,
                      completed: !!interactive.quiz.attempt?.completed_at,
                    }
                  : null,
              };
            },
          }),
        }
      : undefined;

  // ---- stream -------------------------------------------------------------
  const conversationIdFinal = conversationId;
  const result = streamText({
    model: helpChatModel(),
    system,
    messages: messages.map((m) => ({ role: m.role, content: m.content })),
    tools,
    // Cap multi-step tool turns: one tool call + one final response is plenty
    // for our single read-only tool. Prevents pathological loop on hostile
    // prompts that try to chain tool calls.
    stopWhen: stepCountIs(3),
    onFinish: async ({ text, usage }) => {
      try {
        await svc.from("help_chat_messages").insert({
          conversation_id: conversationIdFinal,
          role: "assistant",
          content: text,
          model: HELP_CHAT_MODEL_ID,
          prompt_tokens: usage?.inputTokens ?? null,
          completion_tokens: usage?.outputTokens ?? null,
        } as never);
      } catch (err) {
        console.error("[help-chat] assistant insert failed", err);
      }
    },
    onError: async ({ error }) => {
      console.error("[help-chat] stream error", error);
      try {
        await svc.from("help_chat_messages").insert({
          conversation_id: conversationIdFinal,
          role: "assistant",
          content: "[truncated: stream error]",
          model: HELP_CHAT_MODEL_ID,
        } as never);
      } catch {
        // best-effort
      }
    },
  });

  // NOTE: We use `toTextStreamResponse()` (plain text/event chunks) rather
  // than `toUIMessageStreamResponse()` because `@ai-sdk/react` (which provides
  // the matching `useChat` consumer) is not installed in this project. The
  // custom client in `AskAITab.tsx` reads the body stream directly. Switching
  // to the UI-message stream is a future enhancement once we add @ai-sdk/react.
  return result.toTextStreamResponse({
    headers: {
      "x-help-chat-conversation-id": conversationIdFinal,
    },
  });
}

