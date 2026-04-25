import { PageStub } from "@/components/page-stub";

export default function Page() {
  return (
    <PageStub
      title="Activity"
      description="Raw event feed: registrations, submissions, lab progress."
      caps={["roster.read"]}
    />
  );
}
