import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getPermohonanUser } from "@/actions/permohonan";
import StatusClient from "./status-client";

export default async function StatusPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  if (session.user.role === "admin") {
    redirect("/admin");
  }

  const data = await getPermohonanUser();

  return (
    <StatusClient
      data={JSON.parse(JSON.stringify(data))}
    />
  );
}