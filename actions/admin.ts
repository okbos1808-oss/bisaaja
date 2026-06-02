"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { StatusPermohonan } from "@/src/generated/client";
import { revalidatePath } from "next/cache";

export async function getPermohonanAdmin() {
  const session = await auth();

  if (!session?.user?.id || session.user.role !== "admin") {
    throw new Error("Unauthorized");
  }

  try {
    return await prisma.permohonan.findMany({
      include: {
        user: {
          select: { name: true, email: true },
        },
        validasi: true,
        pembayaran: true,
        komentar: {
          orderBy: { createdAt: "asc" },
        },
      },
      orderBy: { createdAt: "desc" },
    });
  } catch (error) {
    console.error("GET ADMIN ERROR:", error);
    return [];
  }
}

export async function updateStatus(id: string, status: StatusPermohonan) {
  try {
    const session = await auth();

    if (!session?.user?.id || session.user.role !== "admin") {
      return { error: "Unauthorized" };
    }

    const permohonan = await prisma.permohonan.findUnique({ where: { id } });

    if (!permohonan) {
      return { error: "Permohonan tidak ditemukan" };
    }

    await prisma.$transaction([
      prisma.permohonan.update({
        where: { id },
        data: { status },
      }),
      prisma.validasi.upsert({
        where: { permohonanId: id },
        create: { permohonanId: id, adminId: session.user.id, status },
        update: { adminId: session.user.id, status },
      }),
    ]);

    revalidatePath("/admin");
    revalidatePath("/status");

    return { success: true };
  } catch (error) {
    console.error("UPDATE STATUS ERROR:", error);
    return { error: "Gagal update status" };
  }
}

// BARU: simpan penawaran harga dan otomatis kirim notif lewat komentar
export async function simpanPenawaranHarga(
  permohonanId: string,
  hargaPenawaran: string,
  catatanHarga: string
) {
  try {
    const session = await auth();

    if (!session?.user?.id || session.user.role !== "admin") {
      return { error: "Unauthorized" };
    }

    if (!hargaPenawaran.trim()) {
      return { error: "Harga penawaran wajib diisi" };
    }

    const permohonan = await prisma.permohonan.findUnique({
      where: { id: permohonanId },
    });

    if (!permohonan) {
      return { error: "Permohonan tidak ditemukan" };
    }

    // Simpan harga + set status ke PENAWARAN_HARGA_PENETAPAN_BIAYA
    // + otomatis buat komentar agar user melihatnya di halaman status
    await prisma.$transaction([
      prisma.permohonan.update({
        where: { id: permohonanId },
        data: {
          hargaPenawaran: hargaPenawaran.trim(),
          catatanHarga: catatanHarga.trim() || null,
          hargaDikirimAt: new Date(),
          status: StatusPermohonan.PENAWARAN_HARGA_PENETAPAN_BIAYA,
        },
      }),

      prisma.validasi.upsert({
        where: { permohonanId },
        create: {
          permohonanId,
          adminId: session.user.id,
          status: StatusPermohonan.PENAWARAN_HARGA_PENETAPAN_BIAYA,
        },
        update: {
          adminId: session.user.id,
          status: StatusPermohonan.PENAWARAN_HARGA_PENETAPAN_BIAYA,
        },
      }),

      // Komentar otomatis agar user melihat penawaran di halaman /status
      prisma.komentarPermohonan.create({
        data: {
          permohonanId,
          adminName: session.user.name ?? "Admin",
          isi: [
            `💰 Penawaran Harga: ${hargaPenawaran.trim()}`,
            catatanHarga.trim() ? `📝 Catatan: ${catatanHarga.trim()}` : null,
          ]
            .filter(Boolean)
            .join("\n"),
        },
      }),
    ]);

    revalidatePath("/admin");
    revalidatePath("/status");

    return { success: true };
  } catch (error) {
    console.error("SIMPAN HARGA ERROR:", error);
    return { error: "Gagal menyimpan penawaran harga" };
  }
}

export async function tambahKomentar(permohonanId: string, isi: string) {
  const session = await auth();

  if (!session?.user?.id || session.user.role !== "admin") {
    return { error: "Unauthorized" };
  }

  const komentarText = isi.trim();

  if (!komentarText) {
    return { error: "Komentar tidak boleh kosong" };
  }

  try {
    const permohonan = await prisma.permohonan.findUnique({
      where: { id: permohonanId },
    });

    if (!permohonan) {
      return { error: "Permohonan tidak ditemukan" };
    }

    const komentar = await prisma.komentarPermohonan.create({
      data: {
        permohonanId,
        adminName: session.user.name ?? "Admin",
        isi: komentarText,
      },
    });

    revalidatePath("/admin");
    revalidatePath("/status");

    return { success: true, data: komentar };
  } catch (error) {
    console.error("TAMBAH KOMENTAR ERROR:", error);
    return { error: "Gagal menyimpan komentar" };
  }
}

export async function getKomentar(permohonanId: string) {
  const session = await auth();

  if (!session?.user?.id || session.user.role !== "admin") {
    throw new Error("Unauthorized");
  }

  try {
    return await prisma.komentarPermohonan.findMany({
      where: { permohonanId },
      orderBy: { createdAt: "asc" },
    });
  } catch (error) {
    console.error("GET KOMENTAR ERROR:", error);
    return [];
  }
}
export async function editKomentar(
  komentarId: string,
  isi: string
) {
  const session = await auth();

  if (!session?.user?.id || session.user.role !== "admin") {
    return { error: "Unauthorized" };
  }

  const komentar = await prisma.komentarPermohonan.update({
    where: { id: komentarId },
    data: { isi: isi.trim() },
  });

  revalidatePath("/admin");
  revalidatePath("/status");

  return {
    success: true,
    data: komentar,
  };
}

export async function hapusKomentar(
  komentarId: string
) {
  const session = await auth();

  if (!session?.user?.id || session.user.role !== "admin") {
    return { error: "Unauthorized" };
  }

  await prisma.komentarPermohonan.delete({
    where: { id: komentarId },
  });

  revalidatePath("/admin");
  revalidatePath("/status");

  return { success: true };
}
