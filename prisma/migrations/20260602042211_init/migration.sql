/*
  Warnings:

  - You are about to drop the `products` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "StatusPermohonan" AS ENUM ('PENDING', 'DISETUJUI', 'DITOLAK', 'MENUNGGU_PEMBAYARAN', 'MENUNGGU_VERIFIKASI_PEMBAYARAN', 'MENUNGGU_SERTIFIKAT', 'SERTIFIKAT_TERSEDIA');

-- CreateEnum
CREATE TYPE "StatusPembayaran" AS ENUM ('MENUNGGU_VERIFIKASI', 'TERVERIFIKASI', 'DITOLAK');

-- DropForeignKey
ALTER TABLE "products" DROP CONSTRAINT "products_userId_fkey";

-- DropTable
DROP TABLE "products";

-- CreateTable
CREATE TABLE "pembayaran" (
    "id" TEXT NOT NULL,
    "permohonanId" TEXT NOT NULL,
    "buktiBayar" TEXT NOT NULL,
    "status" "StatusPembayaran" NOT NULL DEFAULT 'MENUNGGU_VERIFIKASI',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "pembayaran_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "validasi" (
    "id" TEXT NOT NULL,
    "permohonanId" TEXT NOT NULL,
    "adminId" TEXT NOT NULL,
    "status" "StatusPermohonan" NOT NULL,
    "catatan" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "validasi_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "komentar_permohonan" (
    "id" TEXT NOT NULL,
    "permohonanId" TEXT NOT NULL,
    "adminName" TEXT NOT NULL,
    "isi" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "komentar_permohonan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "permohonan" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "namaUsaha" TEXT NOT NULL,
    "divisi" TEXT NOT NULL,
    "layanan" TEXT NOT NULL,
    "noHp" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "alamat" TEXT NOT NULL,
    "status" "StatusPermohonan" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "permohonan_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "pembayaran_permohonanId_key" ON "pembayaran"("permohonanId");

-- CreateIndex
CREATE UNIQUE INDEX "validasi_permohonanId_key" ON "validasi"("permohonanId");

-- CreateIndex
CREATE INDEX "permohonan_userId_idx" ON "permohonan"("userId");

-- AddForeignKey
ALTER TABLE "pembayaran" ADD CONSTRAINT "pembayaran_permohonanId_fkey" FOREIGN KEY ("permohonanId") REFERENCES "permohonan"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "validasi" ADD CONSTRAINT "validasi_adminId_fkey" FOREIGN KEY ("adminId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "validasi" ADD CONSTRAINT "validasi_permohonanId_fkey" FOREIGN KEY ("permohonanId") REFERENCES "permohonan"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "komentar_permohonan" ADD CONSTRAINT "komentar_permohonan_permohonanId_fkey" FOREIGN KEY ("permohonanId") REFERENCES "permohonan"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "permohonan" ADD CONSTRAINT "permohonan_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
