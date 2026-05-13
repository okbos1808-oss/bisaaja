"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { StatusPermohonan } from "@/src/generated/client";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import fs from "fs/promises";
import path from "path";
import { v4 as uuidv4 } from "uuid";

export async function submitPermohonan(
  formData: FormData
) {
  const session = await auth();

  if (!session?.user?.id) {
    return {
      error: "Harus login",
    };
  }

  try {
    const namaUsaha =
      formData.get(
        "namaUsaha"
      ) as string;

    const jenisIzin =
      formData.get(
        "jenisIzin"
      ) as string;

    const alamat =
      formData.get(
        "alamat"
      ) as string;

    const nib =
      (formData.get(
        "punya_nib"
      ) as string) || null;

    const file =
      formData.get(
        "fileDokumen"
      ) as File;

    if (
      !namaUsaha ||
      !jenisIzin ||
      !alamat
    ) {
      return {
        error:
          "Semua field wajib diisi",
      };
    }

    let filePath = "";

    if (file && file.size > 0) {
      const bytes =
        await file.arrayBuffer();

      const buffer =
        Buffer.from(bytes);

      const uploadDir = path.join(
        process.cwd(),
        "public/uploads"
      );

      await fs.mkdir(uploadDir, {
        recursive: true,
      });

      const fileName = `${uuidv4()}-${
        file.name
      }`;

      const fullPath = path.join(
        uploadDir,
        fileName
      );

      await fs.writeFile(
        fullPath,
        buffer
      );

      filePath = `/uploads/${fileName}`;
    }

    await prisma.permohonan.create({
      data: {
        namaUsaha,
        jenisIzin,
        alamat,
        nib,
        fileDokumen: filePath,
        userId: session.user.id,
        status:
          StatusPermohonan.PENDING,
      },
    });

    revalidatePath("/admin");
    revalidatePath("/status");

    return {
      success: true,
    };
  } catch (error) {
    console.error(
      "CREATE ERROR:",
      error
    );

    return {
      error:
        "Gagal simpan ke database",
    };
  }
}

export async function getPermohonanUser() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  return prisma.permohonan.findMany({
    where: {
      userId: session.user.id,
    },

    include: {
      komentar: {
        orderBy: {
          createdAt: "asc",
        },
      },

      pembayaran: true,

      validasi: true,
    },

    orderBy: {
      createdAt: "desc",
    },
  });
}