import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  const [count, terbaru] = await Promise.all([
    prisma.permohonan.count(),
    prisma.permohonan.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
      select: {
        id: true,
        namaUsaha: true,
        createdAt: true,
        user: { select: { name: true } },
      },
    }),
  ]);

  return NextResponse.json({ count, terbaru });
}