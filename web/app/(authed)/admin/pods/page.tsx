import { redirect } from "next/navigation";

export default function AdminPodsRedirect() {
  redirect("/pods");
}
