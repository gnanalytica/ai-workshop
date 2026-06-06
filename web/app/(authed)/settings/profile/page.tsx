import { redirect } from "next/navigation";
import { Card, CardSub, CardTitle } from "@/components/ui/card";
import { getProfile, getSession } from "@/lib/auth/session";
import { getSupabaseService } from "@/lib/supabase/service";
import { ProfileForm } from "./ProfileForm";
import { ChangeEmailForm } from "./ChangeEmailForm";
import { RollNumberForm } from "./RollNumberForm";

export default async function SettingsProfilePage() {
  const profile = await getProfile();
  if (!profile) redirect("/sign-in");

  const user = await getSession();
  const svc = getSupabaseService();
  const { data: registration } = await svc
    .from("registrations")
    .select("cohort_id, roll_number")
    .eq("user_id", user?.id || "")
    .eq("status", "confirmed")
    .maybeSingle();

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <header>
        <p className="text-accent font-mono text-xs tracking-widest uppercase">Settings</p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight sm:text-3xl">Your profile</h1>
        <CardSub className="mt-1">{profile.email}</CardSub>
      </header>
      <Card className="p-4 sm:p-6">
        <ProfileForm
          initial={{
            full_name: profile.full_name ?? "",
            college: profile.college ?? "",
            avatar_url: profile.avatar_url ?? "",
          }}
        />
      </Card>
      {registration && (
        <Card className="p-4 sm:p-6">
          <CardTitle className="mb-1 text-base">Roll number</CardTitle>
          <CardSub className="mb-4 text-xs">
            Your unique student ID in this cohort. Update it if you entered it incorrectly.
          </CardSub>
          <RollNumberForm current={registration.roll_number} cohortId={registration.cohort_id} />
        </Card>
      )}
      <Card className="p-4 sm:p-6">
        <CardTitle className="mb-1 text-base">Email address</CardTitle>
        <CardSub className="mb-4 text-xs">
          Changing your email sends a confirmation link to the new address. Your old
          address continues to work until you click that link.
        </CardSub>
        <ChangeEmailForm currentEmail={profile.email ?? ""} />
      </Card>
    </div>
  );
}
