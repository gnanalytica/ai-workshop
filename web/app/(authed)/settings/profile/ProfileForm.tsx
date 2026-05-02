"use client";

import { useRef, useState, useTransition } from "react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { updateMyProfile } from "@/lib/actions/profile";
import { getSupabaseBrowser } from "@/lib/supabase/client";

export function ProfileForm({
  initial,
}: {
  initial: { full_name: string; college: string; avatar_url: string };
}) {
  const [fullName, setFullName] = useState(initial.full_name);
  const [college, setCollege] = useState(initial.college);
  const [avatar, setAvatar] = useState(initial.avatar_url);
  const [uploading, setUploading] = useState(false);
  const [pending, start] = useTransition();
  const fileRef = useRef<HTMLInputElement | null>(null);

  async function uploadAvatar(file: File) {
    if (file.size > 2 * 1024 * 1024) {
      toast.error("Image must be under 2MB");
      return;
    }
    setUploading(true);
    try {
      const sb = getSupabaseBrowser();
      const { data: u } = await sb.auth.getUser();
      if (!u.user) {
        toast.error("Not signed in");
        return;
      }
      const ext = file.name.split(".").pop()?.toLowerCase() || "png";
      const path = `${u.user.id}/avatar-${Date.now()}.${ext}`;
      const up = await sb.storage.from("avatars").upload(path, file, { upsert: true });
      if (up.error) {
        toast.error(up.error.message);
        return;
      }
      const { data } = sb.storage.from("avatars").getPublicUrl(path);
      setAvatar(data.publicUrl);
      toast.success("Avatar uploaded — remember to save");
    } finally {
      setUploading(false);
    }
  }

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
      <div className="space-y-2">
        <span className="text-muted text-xs">Avatar</span>
        <div className="flex flex-wrap items-center gap-3">
          {avatar ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={avatar}
              alt="Avatar preview"
              className="bg-bg-soft border-line h-16 w-16 rounded-full border object-cover"
            />
          ) : (
            <div className="bg-bg-soft border-line text-muted flex h-16 w-16 items-center justify-center rounded-full border text-xs">
              none
            </div>
          )}
          <input
            ref={fileRef}
            type="file"
            accept="image/png,image/jpeg,image/webp,image/gif"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) uploadAvatar(f);
              e.target.value = "";
            }}
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={uploading}
            onClick={() => fileRef.current?.click()}
          >
            {uploading ? "Uploading…" : "Upload"}
          </Button>
          {avatar && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setAvatar("")}
              disabled={uploading}
            >
              Clear
            </Button>
          )}
        </div>
        <Input
          type="url"
          value={avatar}
          onChange={(e) => setAvatar(e.target.value)}
          placeholder="…or paste a URL"
        />
      </div>
      <Button onClick={save} disabled={pending || !fullName}>
        {pending ? "Saving…" : "Save changes"}
      </Button>
    </div>
  );
}
