import { prisma } from "@/lib/prisma";
import AdminDashboard from "@/components/AdminDashboard";
import { Metadata } from "next";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Admin Dashboard",
  description: "Kelola permohonan perizinan",
};

export default async function AdminPage() {
  const session = await auth();

  // 🔐 WAJIB: hanya admin
  if (!session?.user || session.user.role !== "admin") {
    redirect("/status");
  }

  const data = await prisma.permohonan.findMany({
    include: {
      user: {
        select: {
          name: true,
          email: true, // ✅ sesuai UI kamu
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return (
    <div className="bg-slate-50 min-h-screen">
      <div className="max-w-screen-xl mx-auto py-10 px-4">
        <h1 className="text-2xl font-bold mb-6">
          Dashboard Admin
        </h1>

        <AdminDashboard data={data} />
        
      </div>
    </div>
  );
}
const session = await auth();

console.log("SESSION:", JSON.stringify(session, null, 2));