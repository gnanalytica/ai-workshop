import { PageStub } from "@/components/page-stub";

export default function Page() {
  return (
    <PageStub
      title="Attendance"
      description="Per-day attendance grid with bulk mark."
      caps={["attendance.mark:cohort"]}
    />
  );
}
