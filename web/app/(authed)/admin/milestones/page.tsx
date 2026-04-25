import { PageStub } from "@/components/page-stub";

export default function Page() {
  return (
    <PageStub
      title="Milestones"
      description="Capstone milestone tracker per student."
      caps={["grading.read"]}
    />
  );
}
