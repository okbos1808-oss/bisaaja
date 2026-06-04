import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

// 🔹 ambil semua user (admin only)
export const getUserData = async () => {
  const session = await auth();

  if (!session?.user || session.user.role !== "admin") {
    redirect("/status");
  }

  try {
    return await prisma.user.findMany({
      orderBy: { id: "desc" },
    });
  } catch (error) {
    console.error("DB ERROR:", error);
    return [];
  }
};

// 🔹 ambil permohonan (admin = semua, user = miliknya)
export const getPermohonan = async () => {
  const session = await auth();

  if (!session?.user) redirect("/login");

  const { id, role } = session.user;

  try {
    const data = await prisma.permohonan.findMany({
      where: role === "admin" ? undefined : { userId: id },

      include: {
        user: {
          select: {
            name: true,
            email: true, // ✅ WAJIB (biar tampil di admin)
          },
        },
        validasi: true,
      },

      orderBy: {
        createdAt: "desc",
      },
    });

    return data;
  } catch (error) {
    console.error("DB ERROR:", error);
    return [];
  }
};