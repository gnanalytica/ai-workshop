import { PageStub } from "@/components/page-stub";

export default function Page() {
  return (
    <PageStub
      title="Analytics"
      description="Cohort completion, leaderboard, at-risk students."
      caps={["analytics.read:cohort"]}
    />
  );
}
