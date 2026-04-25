import { PageStub } from "@/components/page-stub";

export default function Page() {
  return (
    <PageStub
      title="Grading queue"
      description="Submissions awaiting review in your scope."
      caps={["grading.read"]}
    />
  );
}
