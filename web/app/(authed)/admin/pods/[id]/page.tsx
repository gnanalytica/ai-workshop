import { redirect } from "next/navigation";

export default async function AdminPodDetailRedirect({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  redirect(`/pods/${id}`);
}
