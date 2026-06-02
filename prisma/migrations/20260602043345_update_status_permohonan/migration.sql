/*
  Warnings:

  - The values [DITOLAK,MENUNGGU_PEMBAYARAN,MENUNGGU_VERIFIKASI_PEMBAYARAN,MENUNGGU_SERTIFIKAT,SERTIFIKAT_TERSEDIA] on the enum `StatusPermohonan` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "StatusPermohonan_new" AS ENUM ('PENDING', 'DISETUJUI', 'SCREENING_ANALISA_KEBUTUHAN', 'PENAWARAN_HARGA_PENETAPAN_BIAYA', 'PENGUMPULAN_DOKUMEN', 'PEMBUATAN_AKUN_SISTEM_PEMERINTAH', 'PENYUSUNAN_DOKUMEN_PERIZINAN', 'SUBMIT_PENGAJUAN', 'VERIFIKASI_PEMERINTAH', 'AUDIT_VISITASI_PEMERIKSAAN', 'PERBAIKAN_HASIL_AUDIT', 'SUBMIT_PERBAIKAN', 'PERSETUJUAN_DAN_PENERBITAN_SERTIFIKAT', 'CLOSING_DAN_MAINTENANCE_CLIENT');
ALTER TABLE "public"."permohonan" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "validasi" ALTER COLUMN "status" TYPE "StatusPermohonan_new" USING ("status"::text::"StatusPermohonan_new");
ALTER TABLE "permohonan" ALTER COLUMN "status" TYPE "StatusPermohonan_new" USING ("status"::text::"StatusPermohonan_new");
ALTER TYPE "StatusPermohonan" RENAME TO "StatusPermohonan_old";
ALTER TYPE "StatusPermohonan_new" RENAME TO "StatusPermohonan";
DROP TYPE "public"."StatusPermohonan_old";
ALTER TABLE "permohonan" ALTER COLUMN "status" SET DEFAULT 'PENDING';
COMMIT;
