"use client";

import Link from "next/link";
import { FileText, CloudUpload, FilePlus, ArrowRight } from "lucide-react";

export function CTACards() {
  return (
    <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
      {/* Buat Tugas Baru */}
      <div className="relative flex h-[163px] items-center justify-between overflow-hidden rounded-2xl bg-[#0055D4] p-6">
        {/* Left content */}
        <div className="z-10 flex items-start gap-4">
          <FileText className="h-16 w-16 flex-shrink-0 text-white opacity-80" />
          <div className="flex flex-col gap-2">
            <h4 className="text-xl font-bold text-white">Buat Tugas Baru</h4>
            <p className="max-w-[193px] text-[13px] leading-relaxed text-[#D6DFFF]">
              Kirimkan tugas ke banyak kelas sekaligus dengan sistem otomatisasi
              berbasis AI.
            </p>
          </div>
        </div>

        {/* Button */}
        <Link
          href="/guru/classes"
          className="z-10 flex flex-shrink-0 items-center gap-2 rounded-2xl bg-white px-4 py-2.5 transition-colors hover:bg-[#F9FAFB]"
        >
          <FilePlus className="h-5 w-5 text-[#003FA3]" />
          <span className="text-sm font-bold text-[#003FA3]">
            Mulai Sekarang
          </span>
        </Link>
      </div>

      {/* Analisis Progres Siswa */}
      <div className="relative flex h-[163px] items-center justify-between overflow-hidden rounded-2xl bg-[#AA3700] p-6">
        {/* Left content */}
        <div className="z-10 flex items-start gap-4">
          <CloudUpload className="h-16 w-16 flex-shrink-0 text-white opacity-80" />
          <div className="flex flex-col gap-2">
            <h4 className="text-xl font-bold text-white">
              Analisis Progres Siswa
            </h4>
            <p className="max-w-[222px] text-[13px] leading-relaxed text-[#FFD7CB]">
              Masukkan nilai dari Excel atau scan hasil ujian fisik kedalam
              platform ini dan dapatkan insight analisis dengan AI.
            </p>
          </div>
        </div>

        {/* Button */}
        <Link
          href="/guru/analytics"
          className="z-10 flex flex-shrink-0 items-center gap-2 rounded-xl bg-white px-4 py-2.5 transition-colors hover:bg-[#F9FAFB]"
        >
          <span className="text-sm font-bold text-[#822800]">
            Coba Sekarang
          </span>
          <ArrowRight className="h-4 w-4 text-[#822800]" />
        </Link>
      </div>
    </div>
  );
}
