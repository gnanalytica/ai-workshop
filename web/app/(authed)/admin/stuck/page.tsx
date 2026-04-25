import { PageStub } from "@/components/page-stub";

export default function Page() {
  return (
    <PageStub
      title="Stuck Queue"
      description="Live triage queue with claim and resolve actions."
      caps={["support.triage"]}
    />
  );
}
