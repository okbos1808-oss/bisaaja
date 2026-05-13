"use client";

import { useState, useTransition, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { updateStatus, tambahKomentar, getKomentar } from "@/actions/admin";
import { StatusPermohonan } from "@/src/generated/client";

type PermohonanType = {
  id: string;
  namaUsaha: string;
  jenisIzin: string;
  status: StatusPermohonan;
  fileDokumen?: string;
  user: {
    name: string | null;
    email: string | null;
  };
};

type Komentar = {
  id: string;
  adminName: string;
  isi: string;
  createdAt: string;
};

type PanelData = {
  id: string;
  namaUsaha: string;
  namaPemohon: string;
};

const STATUS_LABEL: Record<StatusPermohonan, string> = {
  PENDING: "Menunggu",
  DISETUJUI: "Disetujui",
  DITOLAK: "Ditolak",
  MENUNGGU_PEMBAYARAN: "Menunggu Pembayaran",
  MENUNGGU_VERIFIKASI_PEMBAYARAN: "Verifikasi Pembayaran",
  MENUNGGU_SERTIFIKAT: "Proses Sertifikat",
  SERTIFIKAT_TERSEDIA: "Selesai",
};

function getStatusColor(status: StatusPermohonan) {
  switch (status) {
    case "PENDING":
      return "bg-gray-100 text-gray-600";
    case "DISETUJUI":
      return "bg-green-100 text-green-700";
    case "DITOLAK":
      return "bg-red-100 text-red-700";
    default:
      return "bg-yellow-100 text-yellow-700";
  }
}

function getInitials(name: string | null) {
  if (!name) return "??";
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function formatTime(date: string) {
  return new Date(date).toLocaleTimeString("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function KomentarPanel({
  permohonanId,
  namaUsaha,
  namaPemohon,
  onClose,
}: {
  permohonanId: string;
  namaUsaha: string;
  namaPemohon: string;
  onClose: () => void;
}) {
  const [komentar, setKomentar] = useState<Komentar[]>([]);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(true);
  const [isPending, startTransition] = useTransition();
  const bottomRef = useRef<HTMLDivElement>(null);

  // ✅ FIX ESLint + no loop
  useEffect(() => {
    let active = true;

    async function fetchKomentar() {
      const data = await getKomentar(permohonanId);
      if (!active) return;

      setKomentar(
        data.map((d) => ({
          ...d,
          createdAt: new Date(d.createdAt).toISOString(),
        }))
      );
      setLoading(false);
    }

    fetchKomentar();

    return () => {
      active = false;
    };
  }, [permohonanId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [komentar]);

  function handleSend() {
    if (!text.trim() || isPending) return;

    startTransition(async () => {
      const res = await tambahKomentar(permohonanId, text.trim());
      if (res.success && res.data) {
        setKomentar((prev) => [
          ...prev,
          {
            ...res.data,
            createdAt: new Date(res.data.createdAt).toISOString(),
          },
        ]);
        setText("");
      }
    });
  }

  return (
    <>
      <div
        className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40"
        onClick={onClose}
      />

      {/* ✅ FIX width */}
      <div className="fixed right-0 top-0 h-full w-[400px] bg-white z-50 flex flex-col shadow-2xl">
        <div className="px-5 py-4 border-b relative">
          <button onClick={onClose} className="absolute right-4 top-4">
            ✕
          </button>
          <p className="font-semibold text-sm">{namaPemohon}</p>
          <p className="text-xs text-slate-400">{namaUsaha}</p>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4 flex flex-col gap-4">
          {loading && (
            <p className="text-center text-slate-400 text-sm mt-8 animate-pulse">
              Memuat...
            </p>
          )}

          {!loading && komentar.length === 0 && (
            <p className="text-center text-slate-400 text-sm mt-8">
              Belum ada komentar
            </p>
          )}

          {komentar.map((k) => (
            <div key={k.id} className="flex gap-2">
              <div className="w-7 h-7 rounded-full bg-blue-100 flex items-center justify-center text-xs">
                {getInitials(k.adminName)}
              </div>
              <div>
                <div className="text-xs text-slate-600">
                  {k.adminName} • {formatTime(k.createdAt)}
                </div>
                <div className="bg-slate-100 p-2 rounded text-sm">
                  {k.isi}
                </div>
              </div>
            </div>
          ))}

          <div ref={bottomRef} />
        </div>

        <div className="p-4 border-t">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Tulis komentar..."
            className="w-full border p-2 rounded text-sm"
          />
          <button
            onClick={handleSend}
            disabled={!text.trim() || isPending}
            className="mt-2 bg-blue-600 text-white px-3 py-1 rounded"
          >
            {isPending ? "Mengirim..." : "Kirim"}
          </button>
        </div>
      </div>
    </>
  );
}

export default function AdminDashboard({ data }: { data: PermohonanType[] }) {
  const [search, setSearch] = useState("");
  const [panelData, setPanelData] = useState<PanelData | null>(null);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [, startTransition] = useTransition();
  const router = useRouter();

  function handleUpdate(id: string, status: StatusPermohonan) {
    setLoadingId(id);

    startTransition(async () => {
      try {
        await updateStatus(id, status);
        router.refresh();
      } catch {
        alert("Gagal update");
      } finally {
        setLoadingId(null);
      }
    });
  }

  // ✅ FIX null-safe search
  const filteredData = (data ?? []).filter((item) => {
    const keyword = search.toLowerCase().trim();
    if (!keyword) return true;

    return (
      (item.user?.name ?? "").toLowerCase().includes(keyword) ||
      (item.user?.email ?? "").toLowerCase().includes(keyword) ||
      (item.namaUsaha ?? "").toLowerCase().includes(keyword) ||
      (item.jenisIzin ?? "").toLowerCase().includes(keyword)
    );
  });

  return (
    <div>
      <input
        type="text"
        placeholder="Cari nama, email, atau usaha..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="mb-4 w-full p-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
      />

      <div className="overflow-x-auto bg-white rounded-xl border">
        <table className="w-full text-sm">
          <thead className="bg-slate-100 text-slate-600">
            <tr>
              <th className="p-3 text-left">Nama</th>
              <th className="p-3 text-left">Email</th>
              <th className="p-3 text-left">Usaha</th>
              <th className="p-3 text-left">Jenis Izin</th>
              <th className="p-3 text-left">Dokumen</th>
              <th className="p-3 text-left">Status</th>
              <th className="p-3 text-center">Aksi</th>
            </tr>
          </thead>

          <tbody>
            {filteredData.map((item) => (
              <tr key={item.id} className="border-t hover:bg-slate-50">
                <td className="p-3">{item.user?.name ?? "-"}</td>
                <td className="p-3">{item.user?.email ?? "-"}</td>
                <td className="p-3">{item.namaUsaha}</td>
                <td className="p-3">{item.jenisIzin}</td>

                <td className="p-3">
                  {item.fileDokumen ? (
                    <a
                      href={item.fileDokumen}
                      target="_blank"
                      rel="noreferrer"
                      className="text-blue-600 underline text-xs"
                    >
                      Lihat
                    </a>
                  ) : (
                    "-"
                  )}
                </td>

                <td className="p-3">
                  <span className={getStatusColor(item.status)}>
                    {STATUS_LABEL[item.status]}
                  </span>
                </td>

                <td className="p-3">
                  <button onClick={() => handleUpdate(item.id, "DISETUJUI")}>
                    ✔
                  </button>
                  <button onClick={() => handleUpdate(item.id, "DITOLAK")}>
                    ✖
                  </button>
                  <button
                    onClick={() =>
                      setPanelData({
                        id: item.id,
                        namaUsaha: item.namaUsaha,
                        namaPemohon: item.user?.name ?? "Pemohon",
                      })
                    }
                  >
                    💬
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredData.length === 0 && (
          <p className="text-center py-6 text-slate-500">
            Data tidak ditemukan
          </p>
        )}
      </div>

      {panelData && (
        <KomentarPanel
          permohonanId={panelData.id}
          namaUsaha={panelData.namaUsaha}
          namaPemohon={panelData.namaPemohon}
          onClose={() => setPanelData(null)}
        />
      )}
    </div>
  );
}