import { PageStub } from "@/components/page-stub";

export default function Page() {
  return (
    <PageStub
      title="Organizations"
      description="Organizations and promo codes."
      caps={["orgs.write"]}
    />
  );
}
