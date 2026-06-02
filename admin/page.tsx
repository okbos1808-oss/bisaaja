"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { StatusPermohonan } from "@/src/generated/client";
import { revalidatePath } from "next/cache";

//////////////////////////////////////////////////
// GET ADMIN DATA ✅
//////////////////////////////////////////////////
export async function getPermohonanAdmin() {
  const session = await auth();

  if (session?.user?.role !== "admin") {
    throw new Error("Unauthorized");
  }

  return prisma.permohonan.findMany({
    include: {
      user: {
        select: {
          name: true,
          email: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });
}

//////////////////////////////////////////////////
// UPDATE STATUS (CORE)
//////////////////////////////////////////////////
export async function updateStatus(
  id: string,
  status: StatusPermohonan
) {
  const session = await auth();

  if (!session?.user || session.user.role !== "admin") {
    return { error: "Unauthorized" };
  }

  try {
    await prisma.permohonan.update({
      where: { id },
      data: { status },
    });

    revalidatePath("/admin");

    return { success: true };
  } catch (error) {
    console.error(error);
    return { error: "Gagal update" };
  }
}

//////////////////////////////////////////////////
// ACTION BUTTONS ✅ (INI YANG ERROR TADI)
//////////////////////////////////////////////////
export async function setujuiAction(formData: FormData) {
  const id = formData.get("id") as string;
  return updateStatus(id, StatusPermohonan.DISETUJUI);
}

