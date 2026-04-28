import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

// next/cache + next/navigation get mocked because the actions module imports them.
vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));
vi.mock("next/navigation", () => ({
  redirect: (url: string) => {
    const e = new Error(`NEXT_REDIRECT:${url}`);
    (e as Error & { digest: string }).digest = `NEXT_REDIRECT;${url}`;
    throw e;
  },
}));

type Rpc = (name: string, args: Record<string, unknown>) => Promise<{ data: unknown; error: unknown }>;

interface MockSvc {
  rpc: ReturnType<typeof vi.fn> & Rpc;
  from: ReturnType<typeof vi.fn>;
  auth: {
    admin: {
      createUser: ReturnType<typeof vi.fn>;
      deleteUser: ReturnType<typeof vi.fn>;
      generateLink: ReturnType<typeof vi.fn>;
    };
  };
}

let svc: MockSvc;

vi.mock("@/lib/supabase/service", () => ({
  getSupabaseService: () => svc,
}));
vi.mock("@/lib/supabase/server", () => ({
  getSupabaseServer: async () => ({
    auth: {
      signInWithOtp: vi.fn(async () => ({ error: null })),
      signInWithOAuth: vi.fn(async () => ({ data: { url: "https://example/oauth" }, error: null })),
      getUser: vi.fn(async () => ({ data: { user: { id: "u1" } } })),
      signOut: vi.fn(async () => undefined),
    },
  }),
}));

function makeProfilesQuery(returnRow: unknown) {
  // Chain: from("profiles").select(...).eq(...).maybeSingle()
  // Also supports .upsert(...) and .update(...).eq(...) returning { error: null }.
  return {
    select: () => ({
      eq: () => ({
        maybeSingle: async () => ({ data: returnRow, error: null }),
      }),
    }),
    upsert: async () => ({ error: null }),
    update: () => ({ eq: async () => ({ error: null }) }),
  };
}

beforeEach(() => {
  svc = {
    rpc: vi.fn() as unknown as MockSvc["rpc"],
    from: vi.fn(() => makeProfilesQuery(null)),
    auth: {
      admin: {
        createUser: vi.fn(async () => ({ data: { user: { id: "new-user-id" } }, error: null })),
        deleteUser: vi.fn(async () => ({ error: null })),
        generateLink: vi.fn(async () => ({
          data: { properties: { action_link: "https://example/magic" } },
          error: null,
        })),
      },
    },
  };
});

afterEach(() => {
  vi.restoreAllMocks();
});

function fd(record: Record<string, string>): FormData {
  const f = new FormData();
  for (const [k, v] of Object.entries(record)) f.set(k, v);
  return f;
}

describe("signUp — single-code dispatch", () => {
  it("rejects an unknown invite code without creating an auth user", async () => {
    svc.rpc = vi.fn(async (name: string) => {
      if (name === "rpc_validate_invite") return { data: null, error: { message: "invite not found" } };
      return { data: null, error: null };
    }) as unknown as MockSvc["rpc"];

    const { signUp } = await import("@/lib/auth/actions");
    const res = await signUp({}, fd({ email: "new@x.com", full_name: "New", code: "BAD-1" }));

    expect(res.ok).toBe(false);
    expect(res.message).toMatch(/not valid/i);
    expect(svc.auth.admin.createUser).not.toHaveBeenCalled();
  });

  it("dispatches a staff code to rpc_redeem_staff_invite", async () => {
    const calls: string[] = [];
    svc.rpc = vi.fn(async (name: string) => {
      calls.push(name);
      if (name === "rpc_validate_invite") return { data: [{ kind: "staff" }], error: null };
      return { data: null, error: null };
    }) as unknown as MockSvc["rpc"];

    const { signUp } = await import("@/lib/auth/actions");
    let threw: unknown = null;
    try {
      await signUp({}, fd({ email: "admin@x.com", full_name: "Admin", code: "adm-abc123" }));
    } catch (e) {
      threw = e;
    }

    // signUp ends in redirect() which our mock turns into a thrown NEXT_REDIRECT.
    expect((threw as Error)?.message).toMatch(/NEXT_REDIRECT/);
    expect(calls).toContain("rpc_validate_invite");
    expect(calls).toContain("rpc_redeem_staff_invite");
    expect(svc.auth.admin.createUser).toHaveBeenCalled();
    // Code is normalized to uppercase before redeem.
    const redeemArgs = (svc.rpc as unknown as { mock: { calls: [string, Record<string, unknown>][] } })
      .mock.calls.find((c) => c[0] === "rpc_redeem_staff_invite")?.[1];
    expect(redeemArgs?.p_code).toBe("ADM-ABC123");
  });

  it("rolls back the auth user when redeem fails (race condition)", async () => {
    svc.rpc = vi.fn(async (name: string) => {
      if (name === "rpc_validate_invite") return { data: [{ kind: "student" }], error: null };
      if (name === "rpc_redeem_student_invite")
        return { data: null, error: { message: "invite invalid or already redeemed" } };
      return { data: null, error: null };
    }) as unknown as MockSvc["rpc"];

    const { signUp } = await import("@/lib/auth/actions");
    const res = await signUp({}, fd({ email: "race@x.com", full_name: "Racer", code: "STU-RACE" }));

    expect(res.ok).toBe(false);
    expect(res.message).toMatch(/invalid|already redeemed/i);
    expect(svc.auth.admin.deleteUser).toHaveBeenCalledWith("new-user-id");
  });
});

describe("claimInvite — single-code dispatch", () => {
  it("dispatches a faculty code to rpc_redeem_faculty_invite", async () => {
    const calls: string[] = [];
    svc.rpc = vi.fn(async (name: string) => {
      calls.push(name);
      if (name === "rpc_validate_invite") return { data: [{ kind: "faculty" }], error: null };
      return { data: null, error: null };
    }) as unknown as MockSvc["rpc"];

    const { claimInvite } = await import("@/lib/auth/actions");
    let threw: unknown = null;
    try {
      await claimInvite({}, fd({ full_name: "Fae Prof", code: "fac-xyz999" }));
    } catch (e) {
      threw = e;
    }

    expect((threw as Error)?.message).toMatch(/NEXT_REDIRECT/);
    expect(calls).toContain("rpc_redeem_faculty_invite");
  });
});
