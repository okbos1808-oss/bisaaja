"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { uploadDokumen } from "@/actions/dokumen";
import { StatusPermohonan } from "@/src/generated/client";
import { MessageCircle, Mail } from "lucide-react";


const statusLabel: Record<StatusPermohonan, string> = {
  PENDING: "Menunggu",
  DISETUJUI: "Disetujui",
  SCREENING_ANALISA_KEBUTUHAN:
    "Screening & Analisa Kebutuhan",
  PENAWARAN_HARGA_PENETAPAN_BIAYA:
    "Penawaran Harga & Penetapan Biaya",
  PENGUMPULAN_DOKUMEN:
    "Pengumpulan Dokumen",
  PEMBUATAN_AKUN_SISTEM_PEMERINTAH:
    "Pembuatan Akun Sistem Pemerintah",
  PENYUSUNAN_DOKUMEN_PERIZINAN:
    "Penyusunan Dokumen Perizinan",
  SUBMIT_PENGAJUAN:
    "Submit Pengajuan",
  VERIFIKASI_PEMERINTAH:
    "Verifikasi Pemerintah",
  AUDIT_VISITASI_PEMERIKSAAN:
    "Audit / Visitasi",
  PERBAIKAN_HASIL_AUDIT:
    "Perbaikan Hasil Audit",
  SUBMIT_PERBAIKAN:
    "Submit Perbaikan",
  PERSETUJUAN_DAN_PENERBITAN_SERTIFIKAT:
    "Penerbitan Sertifikat",
  CLOSING_DAN_MAINTENANCE_CLIENT:
    "Selesai",
};

const statusOrder: StatusPermohonan[] = [
  "PENDING",
  "DISETUJUI",
  "SCREENING_ANALISA_KEBUTUHAN",
  "PENAWARAN_HARGA_PENETAPAN_BIAYA",
  "PENGUMPULAN_DOKUMEN",
  "PEMBUATAN_AKUN_SISTEM_PEMERINTAH",
  "PENYUSUNAN_DOKUMEN_PERIZINAN",
  "SUBMIT_PENGAJUAN",
  "VERIFIKASI_PEMERINTAH",
  "AUDIT_VISITASI_PEMERIKSAAN",
  "PERBAIKAN_HASIL_AUDIT",
  "SUBMIT_PERBAIKAN",
  "PERSETUJUAN_DAN_PENERBITAN_SERTIFIKAT",
  "CLOSING_DAN_MAINTENANCE_CLIENT",
];

type Komentar = {
  id: string;
  isi: string;
  adminName: string;
};

type Permohonan = {
  id: string;
  namaUsaha: string;
  layanan: string;
  status: StatusPermohonan;
  fileDokumen: string | null;
  komentar?: Komentar[];
};

type Props = {
  data: Permohonan[];
};

function getBadgeColor(
  status: StatusPermohonan
) {
  switch (status) {
    case "PENDING":
      return "bg-gray-100 text-gray-700";

    case "DISETUJUI":
      return "bg-green-100 text-green-700";

    case "PERSETUJUAN_DAN_PENERBITAN_SERTIFIKAT":
      return "bg-emerald-100 text-emerald-700";

    case "CLOSING_DAN_MAINTENANCE_CLIENT":
      return "bg-teal-100 text-teal-700";

    default:
      return "bg-blue-100 text-blue-700";
  }
}

export default function StatusClient({
  data,
}: Props) {
  console.log("CLIENT DATA:", data);

  const [isPending, startTransition] =
    useTransition();

  return (
    <div className="max-w-6xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold mb-8">
        Status Permohonan
      </h1>

      {data.length === 0 ? (
        <div className="bg-white rounded-xl border p-10 text-center">
          <p className="text-slate-500">
            Belum ada permohonan
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {data.map((item) => {
            const currentStep =
              statusOrder.indexOf(item.status);

            const canUpload =
              item.status ===
              "PENAWARAN_HARGA_PENETAPAN_BIAYA";

            return (
              <div
                key={item.id}
                className="bg-white rounded-xl border shadow-sm overflow-hidden"
              >
                <div className="p-4 sm:p-6 border-b flex flex-col gap-3 sm:flex-row sm:justify-between sm:items-center">
                  <div>
                    <h2 className="text-xl font-bold">
                      {item.namaUsaha}
                    </h2>

                    <p className="text-sm text-slate-500">
                      {item.layanan}
                    </p>
                  </div>

                  <span
                    className={`px-4 py-2 rounded-full text-sm font-medium ${getBadgeColor(
                      item.status
                    )}`}
                  >
                    {statusLabel[item.status]}
                  </span>
                </div>

                <div className="p-6">
                  <div className="space-y-3">
                    {statusOrder.map(
                      (status, index) => (
                        <div
                          key={status}
                          className="flex gap-4"
                        >
                          <div
                            className={`w-5 h-5 rounded-full mt-1 ${
                              index <=
                              currentStep
                                ? "bg-green-500"
                                : "bg-gray-300"
                            }`}
                          />

                          <p
                            className={`font-medium ${
                              index <=
                              currentStep
                                ? "text-green-700"
                                : "text-slate-500"
                            }`}
                          >
                            {
                              statusLabel[
                                status
                              ]
                            }
                          </p>
                        </div>
                      )
                    )}
                  </div>
                  {item.status ===
                "PENGUMPULAN_DOKUMEN" && (
              <div className="mt-6 border rounded-xl p-5 bg-blue-50">
                <h3 className="font-semibold text-lg mb-2">
                  Hubungi Admin
                </h3>

                <p className="text-sm text-slate-600 mb-4">
                  pengumpulan dokumen dilakukan melalui whatsapp atau email. Jika ada pertanyaan terkait proses
                  perizinan, silakan hubungi admin .
                </p>

                <div className="flex flex-col sm:flex-row gap-3">
                  <a
                    href={`https://wa.me/6281278220598?text=${encodeURIComponent(
                      `Halo Admin,

            Nama Usaha : ${item.namaUsaha}
            Layanan : ${item.layanan}
            Status Saat Ini : ${
                        statusLabel[item.status]
                      }

            Saya ingin menanyakan progres perizinan saya.`
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-green-600 text-white px-4 py-2 rounded-lg flex items-center gap-2"
                  >
                    <MessageCircle size={18} />
                    WhatsApp
                  </a>

                  <a
                    href={`mailto:okbos1808@gmail.com?subject=${encodeURIComponent(
                      `Konsultasi Perizinan - ${item.namaUsaha}`
                    )}&body=${encodeURIComponent(
                      `Halo Admin,

            Nama Usaha : ${item.namaUsaha}
            Layanan : ${item.layanan}
            Status Saat Ini : ${
                        statusLabel[item.status]
                      }

            Saya ingin menanyakan progres perizinan saya.`
                    )}`}
                    className="bg-red-600 text-white px-4 py-2 rounded-lg flex items-center gap-2"
                  >
                    <Mail size={18} />
                    Email
                  </a>
                </div>
              </div>
            )}
                  

                  {canUpload && (
                   <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        const form = e.currentTarget;
                        const formData = new FormData(form);
                        startTransition(async () => {
                          const res = await uploadDokumen(formData);
                          if (res?.success) {
                            toast.success("Dokumen berhasil diupload");
                            form.reset(); // ← ini yang diubah
                            window.location.reload();
                          } else {
                            toast.error(res?.error || "Upload gagal");
                          }
                        });
                      }}
                    className="
mt-6
flex
flex-col
sm:flex-row
gap-3
sm:items-center
"
                    >
                      <input
                        type="hidden"
                        name="permohonanId"
                        value={item.id}
                      />

                      <input
                        type="file"
                        name="dokumen"
                        required
                        className="border p-2 rounded"
                      />

                      <button
                        type="submit"
                        disabled={isPending}
                        className="bg-blue-600 text-white px-4 py-2 rounded"
                      >
                        {isPending
                          ? "Uploading..."
                          : "Upload Dokumen"}
                      </button>
                    </form>
                  )}

                  {item.fileDokumen && (
                    <div className="mt-6 p-4 border rounded-lg bg-green-50">
                      <p className="font-semibold text-green-700">
                        ✓ Dokumen telah diupload
                      </p>

                      <a
                        href={item.fileDokumen}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 underline"
                      >
                        Lihat / Download File
                      </a>
                    </div>
                  )}

                  {item.komentar &&
                    item.komentar.length >
                      0 && (
                      <div className="mt-8">
                        <h3 className="font-semibold mb-3">
                          Komentar Admin
                        </h3>

                        <div className="space-y-3">
                          {item.komentar.map(
                            (komentar) => (
                              <div
                                key={
                                  komentar.id
                                }
                                className="bg-slate-50 border rounded-lg p-3 sm:p-4"
                              >
                                <p className="font-medium text-sm">
                                  {
                                    komentar.adminName
                                  }
                                </p>

                                <p className="text-sm text-slate-600 mt-1">
                                  {
                                    komentar.isi
                                  }
                                </p>
                              </div>
                            )
                          )}
                        </div>
                      </div>
                    )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}