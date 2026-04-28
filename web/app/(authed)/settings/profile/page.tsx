import { redirect } from "next/navigation";
import { Card, CardSub, CardTitle } from "@/components/ui/card";
import { getProfile } from "@/lib/auth/session";
import { ProfileForm } from "./ProfileForm";
import { ChangeEmailForm } from "./ChangeEmailForm";

export default async function SettingsProfilePage() {
  const profile = await getProfile();
  if (!profile) redirect("/sign-in");

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <header>
        <p className="text-accent font-mono text-xs tracking-widest uppercase">Settings</p>
        <h1 className="mt-1 text-3xl font-semibold tracking-tight">Your profile</h1>
        <CardSub className="mt-1">{profile.email}</CardSub>
      </header>
      <Card className="p-6">
        <ProfileForm
          initial={{
            full_name: profile.full_name ?? "",
            college: profile.college ?? "",
            avatar_url: profile.avatar_url ?? "",
          }}
        />
      </Card>
      <Card className="p-6">
        <CardTitle className="mb-1 text-base">Email address</CardTitle>
        <CardSub className="mb-4 text-xs">
          Changing your email sends a confirmation link to the new address. Your old
          address keeps working until you click that link.
        </CardSub>
        <ChangeEmailForm currentEmail={profile.email ?? ""} />
      </Card>
    </div>
  );
}
