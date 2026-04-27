import { redirect } from "next/navigation";

export default function BoardModRedirect() {
  redirect("/board?mod=1");
}
