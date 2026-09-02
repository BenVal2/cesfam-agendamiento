import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import AdminContent from "@/components/AdminContent";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const session = await auth();
  if (!session) redirect("/login?callbackUrl=/admin");

  const role = (session.user as Record<string, unknown>)?.role;
  if (role !== "admin") redirect("/");

  return <AdminContent />;
}
