"use client";

import { useRef, useState, useTransition } from "react";
import { submitPermohonan } from "@/actions/permohonan";

import {
  Building2,
  FileText,
  MapPin,
  CheckCircle2,
  AlertCircle,
  Loader2,
  BriefcaseBusiness,
  Phone,
  Mail,
} from "lucide-react";

const LAYANAN = {
  legalitas: [
    "Pengurusan NIB",
    "Pengurusan OSS",
    "Izin Usaha",
    "Dokumen Hukum Perusahaan",
    "Perpanjangan Izin",
    "Kepatuhan Regulasi",
  ],

  business: [
    "Konsultasi Bisnis",
    "Pengembangan Bisnis",
    "Kerja Sama Usaha",
    "Strategi Pemasaran",
    "Pencarian Partner Bisnis",
    "Analisis Peluang Usaha",
  ],
};

export default function FormPendaftaran() {
  const formRef = useRef<HTMLFormElement>(null);

  const [isPending, startTransition] = useTransition();

  const [result, setResult] = useState<{
    success?: boolean;
    error?: string;
  } | null>(null);

  const [divisi, setDivisi] = useState("");

  const [layanan, setLayanan] = useState("");

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const formData = new FormData(e.currentTarget);

    setResult(null);

    startTransition(async () => {
      const res = await submitPermohonan(formData);

      setResult(res);

      if (res.success) {
        formRef.current?.reset();
        setDivisi("");
        setLayanan("");
      }
    });
  }

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-1">
            <Building2 className="text-blue-600 w-6 h-6" />

            <span className="text-sm font-medium text-blue-600 uppercase tracking-widest">
              Sistem Perizinan Usaha
            </span>
          </div>

          <h1 className="text-3xl font-bold text-slate-800">
            Pendaftaran Permohonan
          </h1>

          <p className="text-slate-500 mt-1">
            Isi formulir berikut untuk mengajukan layanan usaha Anda.
          </p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
          {result?.success && (
            <div className="flex items-start gap-3 bg-green-50 border border-green-200 text-green-800 rounded-xl p-4 mb-6">
              <CheckCircle2 className="w-5 h-5 mt-0.5 shrink-0" />

              <div>
                <p className="font-semibold">
                  Permohonan Berhasil Dikirim!
                </p>

                <p className="text-sm text-green-700">
                  Permohonan Anda sedang diproses.
                </p>
              </div>
            </div>
          )}

          {result?.error && (
            <div className="flex items-start gap-3 bg-red-50 border border-red-200 text-red-800 rounded-xl p-4 mb-6">
              <AlertCircle className="w-5 h-5 mt-0.5 shrink-0" />

              <p>{result.error}</p>
            </div>
          )}

          <form
            ref={formRef}
            onSubmit={handleSubmit}
            className="space-y-6"
          >
            {/* Nama Usaha */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                <span className="flex items-center gap-1.5">
                  <Building2 className="w-4 h-4 text-slate-400" />

                  Nama Usaha <span className="text-red-500">*</span>
                </span>
              </label>

              <input
                type="text"
                name="namaUsaha"
                required
                placeholder="Contoh: Toko Maju Jaya"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              />
            </div>

            {/* Divisi */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                <span className="flex items-center gap-1.5">
                  <BriefcaseBusiness className="w-4 h-4 text-slate-400" />

                  Divisi <span className="text-red-500">*</span>
                </span>
              </label>

              <select
                name="divisi"
                required
                value={divisi}
                onChange={(e) => {
                  setDivisi(e.target.value);
                  setLayanan("");
                }}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              >
                <option value="">-- Pilih Divisi --</option>

                <option value="legalitas">
                  Eksekutif Legalitas / Legal Officer
                </option>

                <option value="business">
                  Eksekutif Business Development
                </option>
              </select>
            </div>

            {/* Layanan */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                <span className="flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-slate-400" />

                  Layanan <span className="text-red-500">*</span>
                </span>
              </label>

              <select
                name="layanan"
                required
                value={layanan}
                onChange={(e) => setLayanan(e.target.value)}
                disabled={!divisi}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition disabled:opacity-50"
              >
                <option value="">-- Pilih Layanan --</option>

                {divisi &&
                  LAYANAN[divisi as keyof typeof LAYANAN].map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
              </select>

              {/* Info NIB */}
              {divisi === "legalitas" &&
                layanan &&
                layanan !== "Pengurusan NIB" && (
                  <p className="mt-2 text-sm text-amber-600">
                    Untuk layanan ini, pelaku usaha wajib sudah memiliki NIB.
                  </p>
                )}
            </div>

            {/* Nomor HP */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                <span className="flex items-center gap-1.5">
                  <Phone className="w-4 h-4 text-slate-400" />

                  Nomor HP <span className="text-red-500">*</span>
                </span>
              </label>

              <input
                type="tel"
                name="noHp"
                required
                placeholder="081234567890"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                <span className="flex items-center gap-1.5">
                  <Mail className="w-4 h-4 text-slate-400" />

                  Email <span className="text-red-500">*</span>
                </span>
              </label>

              <input
                type="email"
                name="email"
                required
                placeholder="email@gmail.com"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              />
            </div>

            {/* Alamat */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                <span className="flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-slate-400" />

                  Alamat Usaha <span className="text-red-500">*</span>
                </span>
              </label>

              <textarea
                name="alamat"
                required
                rows={3}
                placeholder="Jl. Contoh No.1, Kecamatan, Kota"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition resize-none"
              />
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isPending}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold py-3 rounded-xl transition flex items-center justify-center gap-2"
            >
              {isPending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />

                  Mengirim Permohonan...
                </>
              ) : (
                "Kirim Permohonan"
              )}
            </button>
          </form>
        </div>

        <p className="text-center text-xs text-slate-400 mt-6">
          Pastikan data yang diisi sudah benar sebelum mengirim permohonan.
        </p>
      </div>
    </div>
  );
}