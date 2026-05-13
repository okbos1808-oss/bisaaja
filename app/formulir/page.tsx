import FormPendaftaran from "@/components/FormPendaftaran";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Formulir Permohonan",
  description: "Isi formulir permohonan izin",
};

export default function FormulirPage() {
  return (
    <div className="bg-slate-50 min-h-screen">
      <div className="max-w-screen-md mx-auto py-10 px-4">
        <h1 className="text-2xl font-bold mb-6">
          Formulir Permohonan
        </h1>

        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <FormPendaftaran />
        </div>
      </div>
    </div>
  );
}