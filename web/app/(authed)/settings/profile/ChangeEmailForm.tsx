"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { updateMyEmail } from "@/lib/actions/profile";

export function ChangeEmailForm({ currentEmail }: { currentEmail: string }) {
  const [email, setEmail] = useState("");
  const [pending, start] = useTransition();
  const [confirmSent, setConfirmSent] = useState<string | null>(null);

  function submit() {
    const trimmed = email.trim().toLowerCase();
    if (!trimmed) {
      toast.error("Enter a new email");
      return;
    }
    start(async () => {
      const r = await updateMyEmail({ email: trimmed });
      if (r.ok) {
        setConfirmSent(trimmed);
        setEmail("");
        toast.success(`Confirmation link sent to ${trimmed}`);
      } else {
        toast.error(r.error);
      }
    });
  }

  return (
    <div className="space-y-3">
      <label className="block">
        <span className="text-muted text-xs">Current</span>
        <Input className="mt-1" value={currentEmail} readOnly />
      </label>
      <label className="block">
        <span className="text-muted text-xs">New email</span>
        <Input
          className="mt-1"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="new@example.com"
          autoComplete="email"
        />
      </label>
      <Button onClick={submit} disabled={pending || !email}>
        {pending ? "Sending…" : "Send confirmation"}
      </Button>
      {confirmSent && (
        <p className="text-accent text-xs">
          Check <span className="font-medium">{confirmSent}</span> for a confirmation
          link. You will continue to use <span className="font-medium">{currentEmail}</span>{" "}
          until you click the link.
        </p>
      )}
    </div>
  );
}
