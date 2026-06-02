"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

import { revalidatePath } from "next/cache";

export async function kirimPesan(
  formData: FormData
) {
  const session = await auth();

  if (!session?.user) {
    return {
      error: "Harus login",
    };
  }

  try {
    const permohonanId =
      formData.get("permohonanId") as string;

    const isi =
      formData.get("isi") as string;

    if (!permohonanId || !isi) {
      return {
        error: "Pesan kosong",
      };
    }

    await prisma.komentarPermohonan.create({
      data: {
        permohonanId,
        isi,
        adminName:
          session.user.name || "User",
      },
    });

    revalidatePath("/status");
    revalidatePath("/admin");

    return {
      success: true,
    };
  } catch (error) {
    console.error(error);

    return {
      error: "Gagal kirim pesan",
    };
  }
}