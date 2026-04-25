import { PageStub } from "@/components/page-stub";

export default function Page() {
  return (
    <PageStub
      title="Polls"
      description="Daily polls, open/close timing, results."
      caps={["content.write"]}
    />
  );
}
