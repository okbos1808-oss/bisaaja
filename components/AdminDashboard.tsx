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

const STATUS_LABEL: Record<
  StatusPermohonan,
  string
> = {
  PENDING: "Menunggu",
  DISETUJUI: "Disetujui",

  SCREENING_ANALISA_KEBUTUHAN:
    "Screening & Analisa Kebutuhan",

  PENAWARAN_HARGA_PENETAPAN_BIAYA:
    "Penawaran Harga & Penetapan Biaya",

  PENGUMPULAN_DOKUMEN:
    "Pengumpulan Dokumen",

  PEMBUATAN_AKUN_SISTEM_PEMERINTAH:
    "Pembuatan & Registrasi Akun Sistem Pemerintah",

  PENYUSUNAN_DOKUMEN_PERIZINAN:
    "Penyusunan Dokumen Perizinan",

  SUBMIT_PENGAJUAN:
    "Submit Pengajuan",

  VERIFIKASI_PEMERINTAH:
    "Verifikasi Pemerintah",

  AUDIT_VISITASI_PEMERIKSAAN:
    "Audit / Visitasi / Pemeriksaan",

  PERBAIKAN_HASIL_AUDIT:
    "Perbaikan Hasil Audit",

  SUBMIT_PERBAIKAN:
    "Submit Perbaikan",

  PERSETUJUAN_DAN_PENERBITAN_SERTIFIKAT:
    "Persetujuan & Penerbitan Sertifikat",

  CLOSING_DAN_MAINTENANCE_CLIENT:
    "Closing & Maintenance Client",
};

function getStatusColor(
  status: StatusPermohonan
) {
  switch (status) {
    case "PENDING":
      return "bg-gray-100 text-gray-700";

    case "DISETUJUI":
      return "bg-green-100 text-green-700";

    case "SCREENING_ANALISA_KEBUTUHAN":
      return "bg-blue-100 text-blue-700";

    case "PENAWARAN_HARGA_PENETAPAN_BIAYA":
      return "bg-yellow-100 text-yellow-700";

    case "PENGUMPULAN_DOKUMEN":
      return "bg-orange-100 text-orange-700";

    case "PEMBUATAN_AKUN_SISTEM_PEMERINTAH":
      return "bg-indigo-100 text-indigo-700";

    case "PENYUSUNAN_DOKUMEN_PERIZINAN":
      return "bg-purple-100 text-purple-700";

    case "SUBMIT_PENGAJUAN":
      return "bg-cyan-100 text-cyan-700";

    case "VERIFIKASI_PEMERINTAH":
      return "bg-sky-100 text-sky-700";

    case "AUDIT_VISITASI_PEMERIKSAAN":
      return "bg-pink-100 text-pink-700";

    case "PERBAIKAN_HASIL_AUDIT":
      return "bg-red-100 text-red-700";

    case "SUBMIT_PERBAIKAN":
      return "bg-amber-100 text-amber-700";

    case "PERSETUJUAN_DAN_PENERBITAN_SERTIFIKAT":
      return "bg-emerald-100 text-emerald-700";

    case "CLOSING_DAN_MAINTENANCE_CLIENT":
      return "bg-teal-100 text-teal-700";

    default:
      return "bg-gray-100 text-gray-700";
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
  return new Date(date).toLocaleTimeString(
    "id-ID",
    {
      hour: "2-digit",
      minute: "2-digit",
    }
  );
}

function getDivisiLabel(
  divisi?: string | null
) {
  if (divisi === "legalitas") {
    return "Eksekutif Legalitas";
  }

  if (divisi === "business") {
    return "Business Development";
  }

  return "-";
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
  
  const [komentar, setKomentar] =
    useState<Komentar[]>([]);

  const [text, setText] = useState("");
  const [editingId, setEditingId] =
  useState<string | null>(null);

const [editText, setEditText] =
  useState("");

  const [loading, setLoading] =
    useState(true);

  const [isPending, startTransition] =
    useTransition();

  const bottomRef =
    useRef<HTMLDivElement>(null);

  useEffect(() => {
    let active = true;

    async function fetchKomentar() {
      const data = await getKomentar(
        permohonanId
      );

      if (!active) return;

      setKomentar(
        data.map((d) => ({
          ...d,
          createdAt: new Date(
            d.createdAt
          ).toISOString(),
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
    bottomRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [komentar]);

  function handleSend() {
    if (!text.trim() || isPending)
      return;

    startTransition(async () => {
      const res = await tambahKomentar(
        permohonanId,
        text.trim()
      );

      if (res.success && res.data) {
        setKomentar((prev) => [
          ...prev,
          {
            ...res.data,
            createdAt: new Date(
              res.data.createdAt
            ).toISOString(),
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

      <div className="fixed right-0 top-0 h-full w-[400px] bg-white z-50 flex flex-col shadow-2xl">
        <div className="px-5 py-4 border-b relative">
          <button
            onClick={onClose}
            className="absolute right-4 top-4"
          >
            ✕
          </button>

          <p className="font-semibold text-sm">
            {namaPemohon}
          </p>

          <p className="text-xs text-slate-400">
            {namaUsaha}
          </p>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4 flex flex-col gap-4">
          {loading && (
            <p className="text-center text-slate-400 text-sm mt-8 animate-pulse">
              Memuat...
            </p>
          )}

          {!loading &&
            komentar.length === 0 && (
              <p className="text-center text-slate-400 text-sm mt-8">
                Belum ada komentar
              </p>
            )}

          {komentar.map((k) => (
  <div
    key={k.id}
    className="flex gap-2"
  >
    <div className="w-7 h-7 rounded-full bg-blue-100 flex items-center justify-center text-xs">
      {getInitials(k.adminName)}
    </div>

    <div className="flex-1">
      <div className="flex justify-between items-center">
        <div className="text-xs text-slate-600">
          {k.adminName} •{" "}
          {formatTime(k.createdAt)}
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => {
              setEditingId(k.id);
              setEditText(k.isi);
            }}
            className="text-xs text-blue-600"
          >
            Edit
          </button>

          <button
            onClick={() => {
              if (
                !confirm(
                  "Hapus komentar ini?"
                )
              )
                return;

              startTransition(
                async () => {
                  const res =
                    await hapusKomentar(
                      k.id
                    );

                  if (
                    res.success
                  ) {
                    setKomentar(
                      (
                        prev
                      ) =>
                        prev.filter(
                          (
                            item
                          ) =>
                            item.id !==
                            k.id
                        )
                    );
                  }
                }
              );
            }}
            className="text-xs text-red-600"
          >
            Hapus
          </button>
        </div>
      </div>

      {editingId === k.id ? (
        <div className="mt-2">
          <textarea
            value={editText}
            onChange={(e) =>
              setEditText(
                e.target.value
              )
            }
            className="w-full border rounded p-2 text-sm"
          />

          <div className="flex gap-2 mt-2">
            <button
              onClick={() =>
                setEditingId(
                  null
                )
              }
              className="px-2 py-1 bg-gray-200 rounded text-xs"
            >
              Batal
            </button>

            <button
              onClick={() => {
                startTransition(
                  async () => {
                    const res =
                      await editKomentar(
                        k.id,
                        editText
                      );

                    if (
                      res.success
                    ) {
                      setKomentar(
                        (
                          prev
                        ) =>
                          prev.map(
                            (
                              item
                            ) =>
                              item.id ===
                              k.id
                                ? {
                                    ...item,
                                    isi: editText,
                                  }
                                : item
                          )
                      );

                      setEditingId(
                        null
                      );
                    }
                  }
                );
              }}
              className="px-2 py-1 bg-blue-600 text-white rounded text-xs"
            >
              Simpan
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-slate-100 p-2 rounded text-sm mt-1">
          {k.isi}
        </div>
      )}
    </div>
  </div>
))}
          <div ref={bottomRef} />
        </div>

        <div className="p-4 border-t">
          <textarea
            value={text}
            onChange={(e) =>
              setText(e.target.value)
            }
            placeholder="Tulis komentar..."
            className="w-full border p-2 rounded text-sm"
          />

          <button
            onClick={handleSend}
            disabled={
              !text.trim() || isPending
            }
            className="mt-2 bg-blue-600 text-white px-3 py-1 rounded"
          >
            {isPending
              ? "Mengirim..."
              : "Kirim"}
          </button>
        </div>
      </div>
    </>
  );
}

export default function AdminDashboard({
  data,
}: {
  data: PermohonanType[];
}) {
  const [search, setSearch] =
    useState("");

  const [panelData, setPanelData] =
    useState<PanelData | null>(null);

  const [loadingId, setLoadingId] =
    useState<string | null>(null);

  const [, startTransition] =
    useTransition();

  const router = useRouter();

  async function handleStatusChange(
    id: string,
    status: StatusPermohonan
  ) {
    setLoadingId(id);

    startTransition(async () => {
      try {
        const res = await updateStatus(
          id,
          status
        );

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

  const filteredData = (
    data ?? []
  ).filter((item) => {
    const keyword = search
      .toLowerCase()
      .trim();

    if (!keyword) return true;

    return (
      (item.user?.name ?? "")
        .toLowerCase()
        .includes(keyword) ||
      (item.user?.email ?? "")
        .toLowerCase()
        .includes(keyword) ||
      (item.namaUsaha ?? "")
        .toLowerCase()
        .includes(keyword) ||
      (item.layanan ?? "")
        .toLowerCase()
        .includes(keyword)
    );
  });

  return (
    <div>
      <input
        type="text"
        placeholder="Cari nama, email, usaha, layanan..."
        value={search}
        onChange={(e) =>
          setSearch(e.target.value)
        }
        className="mb-4 w-full p-2 border rounded-lg text-sm"
      />

      <div className="overflow-x-auto bg-white rounded-xl border">
        <table className="w-full text-sm">
          <thead className="bg-slate-100 text-slate-600">
            <tr>
              <th className="p-3 text-left">
                Nama
              </th>

              <th className="p-3 text-left">
                Email
              </th>

              <th className="p-3 text-left">
                Usaha
              </th>

              <th className="p-3 text-left">
                Layanan
              </th>

              <th className="p-3 text-left">
                Dokumen
              </th>

              <th className="p-3 text-left">
                Status
              </th>

              <th className="p-3 text-center">
                Aksi
              </th>
            </tr>
          </thead>

          <tbody>
            {filteredData.map((item) => (
              <tr
                key={item.id}
                className="border-t hover:bg-slate-50"
              >
                <td className="p-3">
                  {item.user?.name ?? "-"}
                </td>

                <td className="p-3">
                  {item.user?.email ?? "-"}
                </td>

                <td className="p-3">
                  {item.namaUsaha}
                </td>

                <td className="p-3">
                  <div className="font-medium">
                    {item.layanan ?? "-"}
                  </div>

                  <div className="text-xs text-slate-500 mt-1">
                    {getDivisiLabel(
                      item.divisi
                    )}
                  </div>
                </td>

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
                  <span
                    className={`px-2 py-1 rounded-full text-xs ${getStatusColor(
                      item.status
                    )}`}
                  >
                    {
                      STATUS_LABEL[
                        item.status
                      ]
                    }
                  </span>
                </td>

                <td className="p-3">
                  <div className="flex items-center justify-center gap-2">
                    <select
                      value={item.status}
                      disabled={
                        loadingId === item.id
                      }
                      onChange={(e) =>
                        handleStatusChange(
                          item.id,
                          e.target
                            .value as StatusPermohonan
                        )
                      }
                      className="border rounded px-2 py-1 text-xs"
                    >
                      {Object.entries(
                        STATUS_LABEL
                      ).map(
                        ([value, label]) => (
                          <option
                            key={value}
                            value={value}
                          >
                            {label}
                          </option>
                        )
                      )}
                    </select>

                    <button
                      onClick={() =>
                        setPanelData({
                          id: item.id,
                          namaUsaha:
                            item.namaUsaha,
                          namaPemohon:
                            item.user?.name ??
                            "Pemohon",
                        })
                      }
                      className="px-2 py-1 rounded bg-blue-100 hover:bg-blue-200"
                    >
                      💬
                    </button>
                  </div>
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
          onClose={() =>
            setPanelData(null)
          }
        />
      )}
    </div>
  );
}