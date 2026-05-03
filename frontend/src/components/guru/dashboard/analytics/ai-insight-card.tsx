"use client";

import {
  Sparkles,
  TrendingDown,
  AlertTriangle,
  TrendingUp,
  Calendar,
} from "lucide-react";

interface InsightItem {
  icon: React.ElementType;
  color: string;
  text: string;
}

interface AIInsightCardProps {
  className?: string;
}

const defaultInsights: InsightItem[] = [
  {
    icon: TrendingDown,
    color: "#E11D48",
    text: "Kelas 9A memiliki tren pengumpulan yang menurun 15% dalam 2 minggu terakhir. Pertimbangkan untuk memberikan reminder tambahan.",
  },
  {
    icon: AlertTriangle,
    color: "#D97706",
    text: "5 siswa konsisten terlambat mengumpulkan tugas Matematika. Pola ini terdeteksi dalam 3 tugas terakhir.",
  },
  {
    icon: TrendingUp,
    color: "#16A34A",
    text: "Rata-rata nilai Bahasa Indonesia naik 8% dibanding bulan lalu. Strategi pembelajaran saat ini efektif.",
  },
  {
    icon: Calendar,
    color: "#2563EB",
    text: "Pola pengumpulan: Siswa paling banyak mengumpulkan tugas di hari Kamis dan Jumat (78% dari total pengumpulan).",
  },
];

export function AIInsightCard({ className: selectedClass }: AIInsightCardProps) {
  // In the future, insights will be generated dynamically based on selectedClass
  // For now, use dummy data
  const insights = defaultInsights;

  return (
    <div className="rounded-xl border border-[#F9FAFB] border-l-4 border-l-[#2563EB] bg-white p-5 shadow-[0_4px_4px_rgba(0,0,0,0.05)] sm:p-6">
      {/* Header */}
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-[#2563EB]" />
          <h3 className="text-lg font-bold text-[#191B23]">AI Insight</h3>
        </div>
        <span className="rounded-full bg-[#EFF6FF] px-2.5 py-0.5 text-xs font-bold text-[#2563EB]">
          Beta
        </span>
      </div>

      {/* Divider */}
      <div className="mb-4 h-px bg-[#E5E7EB]" />

      {/* Insights */}
      <div className="flex flex-col gap-1">
        {insights.map((insight, index) => {
          const Icon = insight.icon;
          return (
            <div
              key={index}
              className="flex items-start gap-3 rounded-lg px-2 py-2.5 transition-colors hover:bg-[#FAFBFC]"
            >
              <Icon
                className="mt-0.5 h-5 w-5 flex-shrink-0"
                style={{ color: insight.color }}
              />
              <p className="text-sm leading-relaxed text-[#434655]">
                {insight.text}
              </p>
            </div>
          );
        })}
      </div>

      {/* Footer note */}
      <div className="mt-4 rounded-lg bg-[#F9FAFB] px-3 py-2">
        <p className="text-xs text-[#8C8D91]">
          {selectedClass
            ? `Insight ini dihasilkan berdasarkan data ${selectedClass}. `
            : "Insight ini dihasilkan berdasarkan data seluruh kelas. "}
          AI Insight masih dalam tahap pengembangan dan akan semakin akurat
          seiring waktu.
        </p>
      </div>
    </div>
  );
}
