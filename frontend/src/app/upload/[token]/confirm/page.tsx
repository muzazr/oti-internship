"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, ArrowRight, ArrowUpRight, Info, User, Loader2, X } from "lucide-react";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";
const TEACHER_WA = "62895397306279";

interface ConfirmData {
  student_name: string;
  class_name: string | null;
  assignment_title: string;
  assignment_subject: string | null;
}

export default function ConfirmPage() {
  const params = useParams();
  const router = useRouter();
  const token = params.token as string;

  const [data, setData] = useState<ConfirmData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch(`${API_BASE}/upload-links/${token}`);
        if (!res.ok) { setError("expired"); return; }
        const result = await res.json();
        setData(result.data);
      } catch { setError("network"); }
      finally { setLoading(false); }
    }
    if (token) fetchData();
  }, [token]);

  if (loading) {
    return (
      <main className="flex justify-center items-center min-h-[80vh]">
        <Loader2 className="w-8 h-8 animate-spin text-[#004AC6]" />
      </main>
    );
  }

  if (error || !data) {
    return (
      <main className="flex justify-center px-4 sm:px-6 py-8 sm:py-14">
        <div className="w-full max-w-[383px] sm:max-w-[500px] lg:max-w-[600px] flex flex-col items-center gap-6 text-center">
          <div className="w-16 h-16 rounded-full bg-[#FFDAD6] flex items-center justify-center">
            <X className="w-8 h-8 text-[#93000A]" />
          </div>
          <p className="text-[#434655] text-sm">
            Link sudah expired atau tidak valid. Ketik 1 di WA bot untuk link baru.
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="flex justify-center px-4 sm:px-6 py-6 sm:py-10 lg:py-14">
      <div className="w-full max-w-[383px] sm:max-w-[500px] lg:max-w-[600px] flex flex-col gap-5 sm:gap-6">
        {/* Back button - pill biru */}
        <button
          onClick={() => router.push(`/upload/${token}/detail`)}
          className="flex items-center gap-2 bg-[#2563EB] text-[#EEEFFF] text-[12px] font-medium px-4 py-2.5 rounded-full w-fit hover:bg-[#1D4ED8] transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Kembali
        </button>

        {/* Progress bar */}
        <div className="flex flex-col gap-2">
          <div className="flex justify-between items-center">
            <span className="text-[12px] font-bold text-[#434655]">Langkah 1 dari 3</span>
            <span className="text-[12px] font-bold text-[#004AC6]">33%</span>
          </div>
          <div className="w-full h-2 bg-[#E1E2ED] rounded-full">
            <div className="h-full w-1/3 bg-[#004AC6] rounded-full transition-all" />
          </div>
        </div>

        {/* Title + subtitle */}
        <div className="flex flex-col gap-1">
          <h1 className="font-bold text-[24px] sm:text-[26px] lg:text-[28px] text-[#191B23]">
            Konfirmasi Datamu
          </h1>
          <p className="text-[16px] text-[#434655] leading-relaxed">
            Pastikan data ini sudah benar sebelum melanjutkan dan mengirimkan tugas.
          </p>
        </div>

        {/* Data card */}
        <div className="bg-[#FAF8FF] rounded-xl sm:rounded-2xl px-5 sm:px-6 py-6 sm:py-8 flex flex-col items-center gap-5">
          {/* Avatar circle */}
          <div className="w-[128px] h-[128px] rounded-full bg-[#F7F9FF] border-2 border-[#E8E8F0] flex items-center justify-center">
            <User className="w-14 h-14 text-[#B0B3C0]" />
          </div>

          {/* Data rows */}
          <div className="w-full flex flex-col divide-y divide-[#E8E8F0]">
            {/* Nama Lengkap */}
            <div className="flex flex-col gap-1 py-3 first:pt-0">
              <span className="text-[12px] font-bold text-[#434655]">Nama Lengkap</span>
              <span className="text-[18px] font-medium text-[#191B23]">{data.student_name}</span>
            </div>

            {/* Kelas */}
            <div className="flex flex-col gap-1 py-3">
              <span className="text-[12px] font-bold text-[#434655]">Kelas</span>
              <span className="text-[18px] font-medium text-[#191B23]">{data.class_name || "-"}</span>
            </div>

            {/* Mata Pelajaran */}
            <div className="flex flex-col gap-1 py-3">
              <span className="text-[12px] font-bold text-[#434655]">Mata Pelajaran</span>
              <span className="text-[18px] font-medium text-[#191B23]">{data.assignment_subject || data.class_name || "-"}</span>
            </div>

            {/* Nama Tugas */}
            <div className="flex flex-col gap-1 py-3 last:pb-0">
              <span className="text-[12px] font-bold text-[#434655]">Nama Tugas</span>
              <span className="text-[18px] font-medium text-[#191B23]">{data.assignment_title}</span>
            </div>
          </div>
        </div>

        {/* Info banner */}
        <div className="flex items-start gap-3 bg-[#F3F3FE] rounded-lg px-4 py-3">
          <Info className="w-6 h-6 text-[#004AC6] flex-shrink-0 mt-0.5" />
          <p className="text-[14px] font-medium text-[#434655] leading-relaxed">
            Data ini otomatis terisi dari sistem. Jika ada data yang salah, silahkan hubungi gurumu!
          </p>
        </div>

        {/* Buttons - Hubungi Guru (kiri) + Lanjut (kanan) */}
        <div className="flex gap-3">
          <a
            href={`https://wa.me/${TEACHER_WA}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 flex items-center justify-center gap-2 h-12 bg-white border border-[#E1E2ED] text-[#000000] font-bold text-[12px] sm:text-sm rounded-xl hover:bg-[#F9FAFB] transition-colors"
          >
            Hubungi Guru
            <ArrowUpRight className="w-4 h-4" />
          </a>
          <Link
            href={`/upload/${token}/submit`}
            className="flex-1 flex items-center justify-center gap-2 h-12 bg-[#004AC6] text-white font-bold text-[12px] sm:text-sm rounded-xl hover:bg-[#003A9E] transition-colors"
          >
            Lanjut
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </main>
  );
}
