import { redirect } from "next/navigation";

export default function BoardModRedirect() {
  redirect("/community?mod=1");
}
