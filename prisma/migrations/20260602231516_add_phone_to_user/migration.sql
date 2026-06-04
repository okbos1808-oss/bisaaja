/*
  Warnings:

  - You are about to drop the `pembayaran` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "pembayaran" DROP CONSTRAINT "pembayaran_permohonanId_fkey";

-- DropTable
DROP TABLE "pembayaran";
