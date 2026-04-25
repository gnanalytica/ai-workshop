import { PageStub } from "@/components/page-stub";

export default function Page() {
  return (
    <PageStub
      title="Board (Mod)"
      description="Moderate Q&A board: pin, hide, soft-delete, accept answer."
      caps={["moderation.write"]}
    />
  );
}
