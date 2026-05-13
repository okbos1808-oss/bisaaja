"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { StatusPermohonan } from "@/src/generated/client";
import { revalidatePath } from "next/cache";

const TRANSISI: Record<
  StatusPermohonan,
  StatusPermohonan[]
> = {
  PENDING: ["DISETUJUI", "DITOLAK"],

  DISETUJUI: ["MENUNGGU_PEMBAYARAN"],

  DITOLAK: [],

  MENUNGGU_PEMBAYARAN: [
    "MENUNGGU_VERIFIKASI_PEMBAYARAN",
  ],

  MENUNGGU_VERIFIKASI_PEMBAYARAN: [
    "MENUNGGU_SERTIFIKAT",
  ],

  MENUNGGU_SERTIFIKAT: [
    "SERTIFIKAT_TERSEDIA",
  ],

  SERTIFIKAT_TERSEDIA: [],
};

export async function getPermohonanAdmin() {
  const session = await auth();

  if (
    !session?.user?.id ||
    session.user.role !== "admin"
  ) {
    throw new Error("Unauthorized");
  }

  try {
    return await prisma.permohonan.findMany({
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },

        validasi: true,

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
  } catch (error) {
    console.error(
      "GET ADMIN ERROR:",
      error
    );

    return [];
  }
}

export async function updateStatus(
  id: string,
  status: StatusPermohonan
) {
  try {
    const session = await auth();

    if (
      !session?.user?.id ||
      session.user.role !== "admin"
    ) {
      return {
        error: "Unauthorized",
      };
    }

    const data =
      await prisma.permohonan.findUnique({
        where: { id },

        select: {
          status: true,
        },
      });

    if (!data) {
      return {
        error: "Data tidak ditemukan",
      };
    }

    const allowedNext =
      TRANSISI[data.status] || [];

    if (
      !allowedNext.includes(status)
    ) {
      return {
        error: `Transisi tidak valid`,
      };
    }

    await prisma.permohonan.update({
      where: { id },

      data: {
        status,

        validasi: {
          upsert: {
            where: {
              permohonanId: id,
            },

            create: {
              adminId:
                session.user.id,

              status:
                status.toString(),
            },

            update: {
              adminId:
                session.user.id,

              status:
                status.toString(),
            },
          },
        },
      },
    });

    revalidatePath("/admin");

    return {
      success: true,
    };
  } catch (error) {
    console.error(
      "UPDATE STATUS ERROR:",
      error
    );

    return {
      error:
        "Gagal update status",
    };
  }
}

export async function setujuiAction(
  formData: FormData
) {
  const id = formData.get(
    "id"
  ) as string;

  return updateStatus(
    id,
    StatusPermohonan.DISETUJUI
  );
}

export async function tolakAction(
  formData: FormData
) {
  const id = formData.get(
    "id"
  ) as string;

  return updateStatus(
    id,
    StatusPermohonan.DITOLAK
  );
}

export async function tambahKomentar(
  permohonanId: string,
  isi: string
) {
  const session = await auth();

  if (
    !session?.user?.id ||
    session.user.role !== "admin"
  ) {
    return {
      error: "Unauthorized",
    };
  }

  if (!isi.trim()) {
    return {
      error:
        "Komentar tidak boleh kosong",
    };
  }

  try {
    const komentar =
      await prisma.komentarPermohonan.create(
        {
          data: {
            permohonanId,

            adminName:
              session.user.name ??
              "Admin",

            isi,
          },
        }
      );

    revalidatePath("/admin");

    return {
      success: true,
      data: komentar,
    };
  } catch (error) {
    console.error(
      "TAMBAH KOMENTAR ERROR:",
      error
    );

    return {
      error:
        "Gagal menyimpan komentar",
    };
  }
}

export async function getKomentar(
  permohonanId: string
) {
  const session = await auth();

  if (
    !session?.user?.id ||
    session.user.role !== "admin"
  ) {
    throw new Error("Unauthorized");
  }

  try {
    return await prisma.komentarPermohonan.findMany(
      {
        where: {
          permohonanId,
        },

        orderBy: {
          createdAt: "asc",
        },
      }
    );
  } catch (error) {
    console.error(
      "GET KOMENTAR ERROR:",
      error
    );

    return [];
  }
}