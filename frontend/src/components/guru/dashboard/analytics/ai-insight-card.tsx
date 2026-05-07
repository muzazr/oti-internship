"use client";

import { Sparkles } from "lucide-react";

interface AIInsightCardProps {
  className?: string;
}

export function AIInsightCard({ className: selectedClass }: AIInsightCardProps) {
  return (
    <div className="rounded-xl border border-[#F9FAFB] border-l-4 border-l-[#2563EB] bg-white p-5 shadow-[0_4px_4px_rgba(0,0,0,0.05)] sm:p-6">
      {/* Header */}
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-[#2563EB]" />
          <h3 className="text-lg font-bold text-[#191B23]">AI Insight</h3>
        </div>
        <span className="rounded-full bg-[#EFF6FF] px-2.5 py-0.5 text-xs font-bold text-[#2563EB]">
          Coming Soon
        </span>
      </div>

      {/* Divider */}
      <div className="mb-4 h-px bg-[#E5E7EB]" />

      {/* Empty / Coming Soon State */}
      <div className="flex flex-col items-center justify-center py-8 text-center">
        <Sparkles className="mb-3 h-10 w-10 text-[#B4C5FF]" />
        <p className="text-sm font-medium text-[#565F6B]">
          AI Insight akan segera hadir
        </p>
        <p className="mt-1 max-w-sm text-xs text-[#8C8D91]">
          Fitur ini sedang dalam pengembangan. AI akan menganalisis pola
          pengumpulan tugas dan memberikan rekomendasi berdasarkan data kelas
          Anda.
        </p>
      </div>

      {/* Footer note */}
      <div className="mt-4 rounded-lg bg-[#F9FAFB] px-3 py-2">
        <p className="text-xs text-[#8C8D91]">
          {selectedClass
            ? `Insight akan dihasilkan berdasarkan data ${selectedClass}. `
            : "Insight akan dihasilkan berdasarkan data seluruh kelas. "}
          Fitur AI Insight sedang dalam tahap pengembangan.
        </p>
      </div>
    </div>
  );
}
