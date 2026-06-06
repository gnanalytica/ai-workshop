"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { updateMyRollNumber } from "@/lib/actions/profile";

export function RollNumberForm({ current, cohortId }: { current: string | null; cohortId: string }) {
  const [pending, startTransition] = useTransition();

  async function save() {
    const input = document.querySelector('input[name="roll_number"]') as HTMLInputElement;
    const value = input?.value.trim();

    if (!value) {
      toast.error("Roll number cannot be empty");
      return;
    }

    startTransition(async () => {
      const r = await updateMyRollNumber(cohortId, value);
      if (r.ok) {
        toast.success("Roll number updated");
      } else {
        toast.error(r.error);
      }
    });
  }

  return (
    <div className="space-y-4">
      <div>
        <label className="block">
          <span className="text-muted text-xs font-medium">Roll number (Student ID)</span>
          <Input
            name="roll_number"
            type="text"
            placeholder="e.g., CSE-2024-001"
            maxLength={64}
            defaultValue={current ?? ""}
            className="mt-1"
          />
        </label>
        <p className="text-muted mt-1 text-xs">
          Unique identifier for your cohort. You can update this if needed.
        </p>
      </div>

      <Button onClick={save} disabled={pending} className="w-full sm:w-auto">
        {pending ? "Saving…" : "Save roll number"}
      </Button>
    </div>
  );
}
