import { redirect } from "next/navigation";

export default async function SignInPage(props: {
  searchParams: Promise<{ next?: string }>;
}) {
  const { next } = await props.searchParams;
  redirect(next ? `/start?next=${encodeURIComponent(next)}` : "/start");
}
