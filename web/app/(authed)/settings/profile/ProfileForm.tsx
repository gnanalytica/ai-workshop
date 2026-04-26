"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { updateMyProfile } from "@/lib/actions/profile";

export function ProfileForm({
  initial,
}: {
  initial: { full_name: string; college: string; avatar_url: string };
}) {
  const [fullName, setFullName] = useState(initial.full_name);
  const [college, setCollege] = useState(initial.college);
  const [avatar, setAvatar] = useState(initial.avatar_url);
  const [pending, start] = useTransition();

  function save() {
    start(async () => {
      const r = await updateMyProfile({
        full_name: fullName.trim(),
        college: college.trim() || null,
        avatar_url: avatar.trim() || null,
      });
      if (r.ok) toast.success("Saved");
      else toast.error(r.error);
    });
  }

  return (
    <div className="space-y-4">
      <label className="block">
        <span className="text-muted text-xs">Full name</span>
        <Input className="mt-1" value={fullName} onChange={(e) => setFullName(e.target.value)} />
      </label>
      <label className="block">
        <span className="text-muted text-xs">College / organization</span>
        <Input className="mt-1" value={college} onChange={(e) => setCollege(e.target.value)} />
      </label>
      <label className="block">
        <span className="text-muted text-xs">Avatar URL</span>
        <Input
          className="mt-1"
          type="url"
          value={avatar}
          onChange={(e) => setAvatar(e.target.value)}
          placeholder="https://…"
        />
      </label>
      <Button onClick={save} disabled={pending || !fullName}>
        {pending ? "Saving…" : "Save changes"}
      </Button>
    </div>
  );
}
