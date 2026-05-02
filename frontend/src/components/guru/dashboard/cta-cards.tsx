"use client";

import Link from "next/link";
import { FileText, CloudUpload, FilePlus, ArrowRight } from "lucide-react";

export function CTACards() {
  return (
    <div className="grid grid-cols-2 gap-5">
      {/* Buat Tugas Baru */}
      <div className="relative bg-[#0055D4] rounded-2xl p-6 flex items-center justify-between overflow-hidden h-[163px]">
        {/* Left content */}
        <div className="flex items-start gap-4 z-10">
          <FileText className="w-16 h-16 text-white opacity-80 flex-shrink-0" />
          <div className="flex flex-col gap-2">
            <h4 className="text-xl font-bold text-white">Buat Tugas Baru</h4>
            <p className="text-[13px] text-[#D6DFFF] leading-relaxed max-w-[193px]">
              Kirimkan tugas ke banyak kelas sekaligus dengan sistem otomatisasi
              berbasis AI.
            </p>
          </div>
        </div>

        {/* Button */}
        <Link
          href="/guru/assignments/new"
          className="flex items-center gap-2 bg-white rounded-2xl px-4 py-2.5 z-10 hover:bg-[#F9FAFB] transition-colors flex-shrink-0"
        >
          <FilePlus className="w-5 h-5 text-[#003FA3]" />
          <span className="text-sm font-medium text-[#003FA3]">
            Mulai Sekarang
          </span>
        </Link>
      </div>

      {/* Analisis Progres Siswa */}
      <div className="relative bg-[#AA3700] rounded-2xl p-6 flex items-center justify-between overflow-hidden h-[163px]">
        {/* Left content */}
        <div className="flex items-start gap-4 z-10">
          <CloudUpload className="w-16 h-16 text-white opacity-80 flex-shrink-0" />
          <div className="flex flex-col gap-2">
            <h4 className="text-xl font-bold text-white">
              Analisis Progres Siswa
            </h4>
            <p className="text-[13px] text-[#FFD7CB] leading-relaxed max-w-[222px]">
              Masukkan nilai dari Excel atau scan hasil ujian fisik kedalam
              platfrom ini dan dapatkan insight analisis dengan AI.
            </p>
          </div>
        </div>

        {/* Button */}
        <Link
          href="/guru/analytics"
          className="flex items-center gap-2 bg-white rounded-xl px-4 py-2.5 z-10 hover:bg-[#F9FAFB] transition-colors flex-shrink-0"
        >
          <span className="text-sm font-medium text-[#822800]">
            Coba Sekarang
          </span>
          <ArrowRight className="w-4 h-4 text-[#822800]" />
        </Link>
      </div>
    </div>
  );
}
