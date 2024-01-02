import { wakeUpAdmin } from "@/functions";
import { currentUser } from "@clerk/nextjs";
import { redirect } from "next/navigation";

export default async function AdminLayout({ children }) {
  const user = await currentUser();
  wakeUpAdmin();

  if (!user) {
    redirect("/");
  }

  if (user?.privateMetadata?.isAdmin !== true) {
    redirect("/");
  }

  return <div>{children}</div>;
}
