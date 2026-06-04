"use client";

import {
  useState,
  useTransition,
  useEffect,
  useRef,
} from "react";
import { useRouter } from "next/navigation";
import {
  updateStatus,
  tambahKomentar,
  getKomentar,
  editKomentar,
  hapusKomentar,
} from "@/actions/admin";
import { StatusPermohonan } from "@/src/generated/client";

type PermohonanType = {
  id: string;
  namaUsaha: string;
  divisi?: string | null;
  layanan?: string | null;
  status: StatusPermohonan;
  fileDokumen?: string | null;
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
  SCREENING_ANALISA_KEBUTUHAN: "Screening & Analisa Kebutuhan",
  PENAWARAN_HARGA_PENETAPAN_BIAYA: "Penawaran Harga & Penetapan Biaya",
  PENGUMPULAN_DOKUMEN: "Pengumpulan Dokumen",
  PEMBUATAN_AKUN_SISTEM_PEMERINTAH: "Pembuatan & Registrasi Akun Sistem Pemerintah",
  PENYUSUNAN_DOKUMEN_PERIZINAN: "Penyusunan Dokumen Perizinan",
  SUBMIT_PENGAJUAN: "Submit Pengajuan",
  VERIFIKASI_PEMERINTAH: "Verifikasi Pemerintah",
  AUDIT_VISITASI_PEMERIKSAAN: "Audit / Visitasi / Pemeriksaan",
  PERBAIKAN_HASIL_AUDIT: "Perbaikan Hasil Audit",
  SUBMIT_PERBAIKAN: "Submit Perbaikan",
  PERSETUJUAN_DAN_PENERBITAN_SERTIFIKAT: "Persetujuan & Penerbitan Sertifikat",
  CLOSING_DAN_MAINTENANCE_CLIENT: "Closing & Maintenance Client",
};

const STATUS_CONFIG: Record<StatusPermohonan, { bg: string; text: string; icon: string }> = {
  PENDING: { bg: "bg-slate-100", text: "text-slate-700", icon: "⏳" },
  DISETUJUI: { bg: "bg-emerald-100", text: "text-emerald-700", icon: "✅" },
  SCREENING_ANALISA_KEBUTUHAN: { bg: "bg-blue-100", text: "text-blue-700", icon: "🔍" },
  PENAWARAN_HARGA_PENETAPAN_BIAYA: { bg: "bg-amber-100", text: "text-amber-700", icon: "💰" },
  PENGUMPULAN_DOKUMEN: { bg: "bg-orange-100", text: "text-orange-700", icon: "📁" },
  PEMBUATAN_AKUN_SISTEM_PEMERINTAH: { bg: "bg-indigo-100", text: "text-indigo-700", icon: "🔐" },
  PENYUSUNAN_DOKUMEN_PERIZINAN: { bg: "bg-violet-100", text: "text-violet-700", icon: "📝" },
  SUBMIT_PENGAJUAN: { bg: "bg-cyan-100", text: "text-cyan-700", icon: "📤" },
  VERIFIKASI_PEMERINTAH: { bg: "bg-sky-100", text: "text-sky-700", icon: "🏛️" },
  AUDIT_VISITASI_PEMERIKSAAN: { bg: "bg-pink-100", text: "text-pink-700", icon: "📋" },
  PERBAIKAN_HASIL_AUDIT: { bg: "bg-rose-100", text: "text-rose-700", icon: "🔧" },
  SUBMIT_PERBAIKAN: { bg: "bg-yellow-100", text: "text-yellow-700", icon: "📨" },
  PERSETUJUAN_DAN_PENERBITAN_SERTIFIKAT: { bg: "bg-green-100", text: "text-green-700", icon: "🎖️" },
  CLOSING_DAN_MAINTENANCE_CLIENT: { bg: "bg-teal-100", text: "text-teal-700", icon: "🤝" },
};

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

function getDivisiLabel(divisi?: string | null) {
  if (divisi === "legalitas") return "Eksekutif Legalitas";
  if (divisi === "business") return "Business Development";
  return "-";
}

// ============ STATUS BADGE COMPONENT ============
function StatusBadge({ status }: { status: StatusPermohonan }) {
  const config = STATUS_CONFIG[status];
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${config.bg} ${config.text}`}
    >
      <span>{config.icon}</span>
      <span className="hidden sm:inline">{STATUS_LABEL[status]}</span>
      <span className="sm:hidden">{STATUS_LABEL[status].split(" ")[0]}</span>
    </span>
  );
}

// ============ KOMENTAR PANEL COMPONENT ============
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
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState("");
  const [loading, setLoading] = useState(true);
  const [isPending, startTransition] = useTransition();
  const bottomRef = useRef<HTMLDivElement>(null);

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

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 transition-opacity"
        onClick={onClose}
      />

      {/* Panel */}
      <div className="fixed inset-y-0 right-0 w-full sm:w-105 bg-white z-50 flex flex-col shadow-2xl animate-slide-in">
        {/* Header */}
        <div className="px-4 sm:px-6 py-4 border-b bg-linear-to-r from-blue-600 to-indigo-600 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-sm font-semibold">
                {getInitials(namaPemohon)}
              </div>
              <div>
                <p className="font-semibold text-sm">{namaPemohon}</p>
                <p className="text-xs text-white/70">{namaUsaha}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-4 space-y-4 bg-slate-50">
          {loading && (
            <div className="flex items-center justify-center h-32">
              <div className="flex items-center gap-2 text-slate-400">
                <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                <span className="text-sm">Memuat komentar...</span>
              </div>
            </div>
          )}

          {!loading && komentar.length === 0 && (
            <div className="flex flex-col items-center justify-center h-32 text-slate-400">
              <svg className="w-12 h-12 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              <span className="text-sm">Belum ada komentar</span>
            </div>
          )}

          {komentar.map((k) => (
            <div key={k.id} className="flex gap-3 group">
              <div className="w-8 h-8 rounded-full bg-linear-to-br from-blue-500 to-indigo-500 flex items-center justify-center text-xs text-white font-medium shrink-0">
                {getInitials(k.adminName)}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-medium text-slate-700">{k.adminName}</span>
                  <span className="text-xs text-slate-400">{formatTime(k.createdAt)}</span>
                  
                  {/* Actions - visible on hover (desktop) or always (mobile) */}
                  <div className="ml-auto flex gap-1 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => {
                        setEditingId(k.id);
                        setEditText(k.isi);
                      }}
                      className="p-1 rounded hover:bg-slate-200 text-slate-500 hover:text-blue-600 transition-colors"
                      title="Edit"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => {
                        if (!confirm("Hapus komentar ini?")) return;
                        startTransition(async () => {
                          const res = await hapusKomentar(k.id);
                          if (res.success) {
                            setKomentar((prev) => prev.filter((item) => item.id !== k.id));
                          }
                        });
                      }}
                      className="p-1 rounded hover:bg-slate-200 text-slate-500 hover:text-red-600 transition-colors"
                      title="Hapus"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>

                {editingId === k.id ? (
                  <div className="space-y-2">
                    <textarea
                      value={editText}
                      onChange={(e) => setEditText(e.target.value)}
                      className="w-full border border-slate-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                      rows={3}
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={() => setEditingId(null)}
                        className="px-3 py-1.5 bg-slate-200 hover:bg-slate-300 rounded-lg text-xs font-medium transition-colors"
                      >
                        Batal
                      </button>
                      <button
                        onClick={() => {
                          startTransition(async () => {
                            const res = await editKomentar(k.id, editText);
                            if (res.success) {
                              setKomentar((prev) =>
                                prev.map((item) =>
                                  item.id === k.id ? { ...item, isi: editText } : item
                                )
                              );
                              setEditingId(null);
                            }
                          });
                        }}
                        className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-medium transition-colors"
                      >
                        Simpan
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="bg-white p-3 rounded-xl rounded-tl-sm shadow-sm border border-slate-100 text-sm text-slate-700">
                    {k.isi}
                  </div>
                )}
              </div>
            </div>
          ))}
          <div ref={bottomRef} />
        </div>

        {/* Input Area */}
        <div className="p-4 border-t bg-white">
          <div className="flex gap-2">
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Tulis komentar... (Enter untuk kirim)"
              className="flex-1 border border-slate-300 p-3 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              rows={2}
            />
            <button
              onClick={handleSend}
              disabled={!text.trim() || isPending}
              className="self-end px-4 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white rounded-xl transition-colors"
            >
              {isPending ? (
                <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes slide-in {
          from {
            transform: translateX(100%);
          }
          to {
            transform: translateX(0);
          }
        }
        .animate-slide-in {
          animation: slide-in 0.3s ease-out;
        }
      `}</style>
    </>
  );
}

// ============ MOBILE CARD COMPONENT ============
function MobileCard({
  item,
  loadingId,
  onStatusChange,
  onOpenKomentar,
}: {
  item: PermohonanType;
  loadingId: string | null;
  onStatusChange: (id: string, status: StatusPermohonan) => void;
  onOpenKomentar: () => void;
}) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-4 space-y-4 shadow-sm hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-full bg-linear-to-br from-blue-500 to-indigo-500 flex items-center justify-center text-white text-sm font-semibold shrink-0">
            {getInitials(item.user?.name)}
          </div>
          <div className="min-w-0">
            <p className="font-semibold text-slate-800 truncate">{item.user?.name ?? "-"}</p>
            <p className="text-xs text-slate-500 truncate">{item.user?.email ?? "-"}</p>
          </div>
        </div>
        <button
          onClick={onOpenKomentar}
          className="shrink-0 w-9 h-9 rounded-full bg-blue-100 hover:bg-blue-200 flex items-center justify-center transition-colors"
        >
          <span className="text-lg">💬</span>
        </button>
      </div>

      {/* Info Grid */}
      <div className="grid grid-cols-2 gap-3 text-sm">
        <div>
          <p className="text-xs text-slate-400 mb-0.5">Nama Usaha</p>
          <p className="font-medium text-slate-700">{item.namaUsaha}</p>
        </div>
        <div>
          <p className="text-xs text-slate-400 mb-0.5">Layanan</p>
          <p className="font-medium text-slate-700">{item.layanan ?? "-"}</p>
        </div>
        <div>
          <p className="text-xs text-slate-400 mb-0.5">Divisi</p>
          <p className="font-medium text-slate-700">{getDivisiLabel(item.divisi)}</p>
        </div>
        <div>
          <p className="text-xs text-slate-400 mb-0.5">Dokumen</p>
          {item.fileDokumen ? (
            <a
              href={item.fileDokumen}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 text-blue-600 font-medium"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              Lihat
            </a>
          ) : (
            <span className="text-slate-400">-</span>
          )}
        </div>
      </div>

      {/* Status & Action */}
      <div className="pt-3 border-t space-y-3">
        <StatusBadge status={item.status} />
        <select
          value={item.status}
          disabled={loadingId === item.id}
          onChange={(e) => onStatusChange(item.id, e.target.value as StatusPermohonan)}
          className="w-full border border-slate-300 rounded-xl px-3 py-2.5 text-sm bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
        >
          {Object.entries(STATUS_LABEL).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}

// ============ MAIN DASHBOARD COMPONENT ============
export default function AdminDashboard({ data }: { data: PermohonanType[] }) {
  const [search, setSearch] = useState("");
  const [panelData, setPanelData] = useState<PanelData | null>(null);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [, startTransition] = useTransition();
  const router = useRouter();

  async function handleStatusChange(id: string, status: StatusPermohonan) {
    setLoadingId(id);
    startTransition(async () => {
      try {
        const res = await updateStatus(id, status);
        if (res?.error) {
          alert(res.error);
          return;
        }
        router.refresh();
      } catch {
        alert("Gagal update");
      } finally {
        setLoadingId(null);
      }
    });
  }

  const filteredData = (data ?? []).filter((item) => {
    const keyword = search.toLowerCase().trim();
    if (!keyword) return true;
    return (
      (item.user?.name ?? "").toLowerCase().includes(keyword) ||
      (item.user?.email ?? "").toLowerCase().includes(keyword) ||
      (item.namaUsaha ?? "").toLowerCase().includes(keyword) ||
      (item.layanan ?? "").toLowerCase().includes(keyword)
    );
  });

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="sticky top-0 z-30 bg-white/80 backdrop-blur-lg border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-slate-800">
                Dashboard Admin
              </h1>
              <p className="text-sm text-slate-500 mt-0.5">
                {filteredData.length} permohonan ditemukan
              </p>
            </div>

            {/* Search */}
            <div className="relative w-full sm:w-80">
              <svg
                className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
              <input
                type="text"
                placeholder="Cari nama, email, usaha, layanan..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
              />
              {search && (
                <button
                  onClick={() => setSearch("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Mobile View - Cards */}
        <div className="lg:hidden space-y-4">
          {filteredData.map((item) => (
            <MobileCard
              key={item.id}
              item={item}
              loadingId={loadingId}
              onStatusChange={handleStatusChange}
              onOpenKomentar={() =>
                setPanelData({
                  id: item.id,
                  namaUsaha: item.namaUsaha,
                  namaPemohon: item.user?.name ?? "Pemohon",
                })
              }
            />
          ))}
        </div>

        {/* Desktop/Tablet View - Table */}
        <div className="hidden lg:block">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200">
                    <th className="px-6 py-4 text-left font-semibold text-slate-600">Pemohon</th>
                    <th className="px-6 py-4 text-left font-semibold text-slate-600">Usaha</th>
                    <th className="px-6 py-4 text-left font-semibold text-slate-600">Layanan</th>
                    <th className="px-6 py-4 text-left font-semibold text-slate-600">Dokumen</th>
                    <th className="px-6 py-4 text-left font-semibold text-slate-600">Status</th>
                    <th className="px-6 py-4 text-center font-semibold text-slate-600">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredData.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-linear-to-br from-blue-500 to-indigo-500 flex items-center justify-center text-white text-sm font-semibold">
                            {getInitials(item.user?.name)}
                          </div>
                          <div>
                            <p className="font-medium text-slate-800">{item.user?.name ?? "-"}</p>
                            <p className="text-xs text-slate-500">{item.user?.email ?? "-"}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <p className="font-medium text-slate-700">{item.namaUsaha}</p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="font-medium text-slate-700">{item.layanan ?? "-"}</p>
                        <p className="text-xs text-slate-500 mt-0.5">{getDivisiLabel(item.divisi)}</p>
                      </td>
                      <td className="px-6 py-4">
                        {item.fileDokumen ? (
                          <a
                            href={item.fileDokumen}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-lg text-xs font-medium transition-colors"
                          >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                            Lihat
                          </a>
                        ) : (
                          <span className="text-slate-400">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <StatusBadge status={item.status} />
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-center gap-2">
                          <select
                            value={item.status}
                            disabled={loadingId === item.id}
                            onChange={(e) =>
                              handleStatusChange(item.id, e.target.value as StatusPermohonan)
                            }
                            className="border border-slate-300 rounded-lg px-3 py-2 text-xs bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 max-w-45"
                          >
                            {Object.entries(STATUS_LABEL).map(([value, label]) => (
                              <option key={value} value={value}>
                                {label}
                              </option>
                            ))}
                          </select>
                          <button
                            onClick={() =>
                              setPanelData({
                                id: item.id,
                                namaUsaha: item.namaUsaha,
                                namaPemohon: item.user?.name ?? "Pemohon",
                              })
                            }
                            className="w-9 h-9 rounded-lg bg-blue-100 hover:bg-blue-200 flex items-center justify-center transition-colors"
                            title="Komentar"
                          >
                            <span className="text-lg">💬</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {filteredData.length === 0 && (
              <div className="flex flex-col items-center justify-center py-16 text-slate-400">
                <svg className="w-16 h-16 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-lg font-medium">Data tidak ditemukan</p>
                <p className="text-sm mt-1">Coba ubah kata kunci pencarian</p>
              </div>
            )}
          </div>
        </div>

        {/* Mobile empty state */}
        {filteredData.length === 0 && (
          <div className="lg:hidden flex flex-col items-center justify-center py-16 text-slate-400">
            <svg className="w-16 h-16 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-lg font-medium">Data tidak ditemukan</p>
            <p className="text-sm mt-1">Coba ubah kata kunci pencarian</p>
          </div>
        )}
      </div>

      {/* Komentar Panel */}
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
