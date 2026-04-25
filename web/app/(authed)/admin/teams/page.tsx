import { PageStub } from "@/components/page-stub";

export default function Page() {
  return (
    <PageStub
      title="Teams"
      description="Team formation and membership."
      caps={["roster.read"]}
    />
  );
}
