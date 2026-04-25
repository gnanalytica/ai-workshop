import { PageStub } from "@/components/page-stub";

export default function Page() {
  return (
    <PageStub
      title="My pod"
      description="Your assigned pod members and their progress."
      caps={["roster.read"]}
    />
  );
}
