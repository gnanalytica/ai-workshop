"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { selfCheckIn } from "@/lib/actions/attendance";

export function CheckIn({
  cohortId,
  dayNumber,
  initialStatus,
}: {
  cohortId: string;
  dayNumber: number;
  initialStatus: "present" | "absent" | "late" | "excused" | null;
}) {
  const [status, setStatus] = useState(initialStatus);
  const [pending, start] = useTransition();
  if (status) return <Badge variant="ok">Checked in · {status}</Badge>;
  return (
    <Button
      variant="outline"
      size="sm"
      disabled={pending}
      onClick={() =>
        start(async () => {
          const r = await selfCheckIn({ cohort_id: cohortId, day_number: dayNumber });
          if (r.ok) {
            setStatus("present");
            toast.success("Checked in");
          } else toast.error(r.error);
        })
      }
    >
      Check in for today
    </Button>
  );
}
