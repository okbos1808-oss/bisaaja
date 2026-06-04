"use server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { supabase } from "@/lib/supabase";
import { revalidatePath } from "next/cache";

export async function uploadDokumen(formData: FormData) {
  try {
    console.log("UPLOAD START");
    const session = await auth();
    if (!session?.user?.id) {
      return { error: "Unauthorized" };
    }

    const permohonanId = formData.get("permohonanId") as string;
    const file = formData.get("dokumen") as File;

    console.log("PERMOHONAN:", permohonanId);
    console.log("FILE:", file?.name, file?.size, file?.type);

    if (!permohonanId || !file) {
      return { error: "File atau ID tidak valid" };
    }

    const bytes = await file.arrayBuffer();
    const uint8Array = new Uint8Array(bytes);

    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
    const fileName = `${Date.now()}-${safeName}`;

    console.log("FILE NAME:", fileName);

    const { data, error } = await supabase.storage
      .from("dokumen-perizinan")
      .upload(fileName, uint8Array, {
        contentType: file.type,
        upsert: true,
      });

    console.log("UPLOAD PATH:", fileName);
    console.log("SUPABASE DATA:", data);
    console.log("SUPABASE ERROR:", error);

    if (error) {
      return { error: error.message };
    }

    const { data: publicUrlData } = supabase.storage
      .from("dokumen-perizinan")
      .getPublicUrl(fileName);

    const fileUrl = publicUrlData.publicUrl;
    console.log("PUBLIC URL:", fileUrl);

    await prisma.permohonan.update({
      where: { id: permohonanId },
      data: {
        fileDokumen: fileUrl,
        // status tidak diubah, admin yang update manual
      },
    });

    revalidatePath("/status");
    revalidatePath("/admin");

    return { success: true };
  } catch (error) {
    console.error("UPLOAD ERROR:", error);
    return {
      error: error instanceof Error ? error.message : "Upload gagal",
    };
  }
}