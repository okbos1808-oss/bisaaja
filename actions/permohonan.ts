"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { StatusPermohonan } from "@/src/generated/client";
import { revalidatePath } from "next/cache";


export async function submitPermohonan(formData: FormData) {
  const session = await auth();

  if (!session?.user?.id) {
    return { error: "Harus login" };
  }

  const namaUsaha = formData.get("namaUsaha")?.toString().trim();
  const divisi    = formData.get("divisi")?.toString().trim();
  const layanan   = formData.get("layanan")?.toString().trim();
  const noHp      = formData.get("noHp")?.toString().trim();
  const email     = formData.get("email")?.toString().trim();
  const alamat    = formData.get("alamat")?.toString().trim();

  if (!namaUsaha || !divisi || !layanan || !noHp || !email || !alamat) {
    return { error: "Semua field wajib diisi" };
  }

  try {
    await prisma.permohonan.create({
      data: {
        namaUsaha,
        divisi,
        layanan,
        noHp,
        email,
        alamat,
        userId: session.user.id,
        status: StatusPermohonan.PENDING,
      },
    });

    revalidatePath("/admin");
    revalidatePath("/status");

    return { success: true };
  } catch (error) {
    console.error("CREATE ERROR:", error);
    return { error: "Gagal menyimpan permohonan" };
  }
}

export async function getPermohonanUser() {
  const session = await auth();

  if (!session?.user?.id) {
    return [];
  }

  try {
    console.log("=== DEBUG START ===");

    const tables = await prisma.$queryRaw`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      ORDER BY table_name
    `;

    console.log("TABLES:", tables);

    const count = await prisma.permohonan.count();

    console.log("PERMOHONAN COUNT:", count);

    const data = await prisma.permohonan.findMany({
      where: {
        userId: session.user.id,
      },
      include: {
        komentar: {
          orderBy: {
            createdAt: "asc",
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return data;
  } catch (error) {
    console.error("GET USER ERROR:", error);
    return [];
  }
}