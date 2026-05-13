import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getPermohonanUser } from "@/actions/permohonan";
import { StatusPermohonan } from "@/src/generated/client";

const badgeColor: Record<StatusPermohonan, string> = {
  PENDING: "bg-gray-100 text-gray-700",
  DISETUJUI: "bg-green-100 text-green-700",
  DITOLAK: "bg-red-100 text-red-700",
  MENUNGGU_PEMBAYARAN: "bg-yellow-100 text-yellow-700",
  MENUNGGU_VERIFIKASI_PEMBAYARAN: "bg-blue-100 text-blue-700",
  MENUNGGU_SERTIFIKAT: "bg-purple-100 text-purple-700",
  SERTIFIKAT_TERSEDIA: "bg-emerald-100 text-emerald-700",
};

const statusLabel: Record<StatusPermohonan, string> = {
  PENDING: "Menunggu",
  DISETUJUI: "Disetujui",
  DITOLAK: "Ditolak",
  MENUNGGU_PEMBAYARAN: "Menunggu Pembayaran",
  MENUNGGU_VERIFIKASI_PEMBAYARAN: "Verifikasi Pembayaran",
  MENUNGGU_SERTIFIKAT: "Proses Sertifikat",
  SERTIFIKAT_TERSEDIA: "Sertifikat Tersedia",
};

const statusIcon: Record<StatusPermohonan, string> = {
  PENDING: "⏳",
  DISETUJUI: "✅",
  DITOLAK: "❌",
  MENUNGGU_PEMBAYARAN: "💳",
  MENUNGGU_VERIFIKASI_PEMBAYARAN: "🧾",
  MENUNGGU_SERTIFIKAT: "📄",
  SERTIFIKAT_TERSEDIA: "🎉",
};

type Permohonan = Awaited<ReturnType<typeof getPermohonanUser>>[number];

export default async function StatusPage() {
  const session = await auth();

  if (!session?.user) redirect("/login");

  if (session.user.role?.toLowerCase() === "admin") {
    redirect("/");
  }

  const data = await getPermohonanUser();

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">
          Status Permohonan Saya
        </h1>

        <p className="text-slate-500 text-sm mt-1">
          Pantau proses pengajuan izin usaha Anda secara realtime
        </p>
      </div>

      {data.length === 0 ? (
        <div className="bg-white border rounded-2xl p-10 text-center">
          <p className="text-slate-500">
            Belum ada permohonan.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto bg-white border rounded-2xl shadow-sm">
          <table className="w-full text-sm">
            <thead className="bg-slate-100 text-slate-700">
              <tr>
                <th className="px-4 py-4 text-left">No</th>
                <th className="px-4 py-4 text-left">Nama Usaha</th>
                <th className="px-4 py-4 text-left">Jenis Izin</th>
                <th className="px-4 py-4 text-left">Tanggal</th>
                <th className="px-4 py-4 text-left">Status</th>
                <th className="px-4 py-4 text-left">Komentar Admin</th>
              </tr>
            </thead>

            <tbody>
              {data.map((item: Permohonan, i: number) => (
                <tr
                  key={item.id}
                  className="border-t hover:bg-slate-50 transition"
                >
                  <td className="px-4 py-4 font-medium">
                    {i + 1}
                  </td>

                  <td className="px-4 py-4">
                    {item.namaUsaha ?? "-"}
                  </td>

                  <td className="px-4 py-4">
                    {item.jenisIzin ?? "-"}
                  </td>

                  <td className="px-4 py-4 text-slate-600">
                    {item.createdAt
                      ? new Date(item.createdAt).toLocaleDateString(
                          "id-ID"
                        )
                      : "-"}
                  </td>

                  <td className="px-4 py-4">
                    <span
                      className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${
                        badgeColor[item.status]
                      }`}
                    >
                      <span>{statusIcon[item.status]}</span>
                      {statusLabel[item.status]}
                    </span>
                  </td>

                  <td className="px-4 py-4">
                    <div className="max-w-[250px]">
                      {item.komentar?.length ? (
                        <div className="bg-slate-100 rounded-xl p-3 text-xs text-slate-700">
                          {
                            item.komentar[
                              item.komentar.length - 1
                            ]?.isi
                          }
                        </div>
                      ) : (
                        <span className="text-slate-400 text-xs">
                          Belum ada komentar
                        </span>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}