"use client";

import { useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

interface SubmissionChartProps {
  weeklyData: Array<{ day: string; count: number }>;
}

export function SubmissionChart({ weeklyData }: SubmissionChartProps) {
  const [activeTab, setActiveTab] = useState<"weekly" | "monthly">("weekly");

  const hasData = weeklyData.some((d) => d.count > 0);

  return (
    <div className="flex min-w-0 flex-1 flex-col rounded-xl border border-[#F9FAFB] bg-white p-4 shadow-[0_4px_4px_rgba(0,0,0,0.05)] sm:p-6">
      {/* Header */}
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-lg font-bold text-[#191B23] sm:text-xl">
          Tren Pengumpulan Tugas
        </h3>
        <div className="flex items-center">
          <button
            onClick={() => setActiveTab("weekly")}
            className={`cursor-pointer rounded-lg px-3 py-1.5 text-xs transition-colors sm:px-4 ${
              activeTab === "weekly"
                ? "bg-[#DAE2FF] font-bold text-[#003FA3]"
                : "font-medium text-[#565F6B] hover:bg-[#F9FAFB]"
            }`}
          >
            Mingguan
          </button>
          <button
            onClick={() => setActiveTab("monthly")}
            className={`cursor-pointer rounded-lg px-3 py-1.5 text-xs transition-colors sm:px-4 ${
              activeTab === "monthly"
                ? "bg-[#DAE2FF] font-bold text-[#003FA3]"
                : "font-medium text-[#565F6B] hover:bg-[#F9FAFB]"
            }`}
          >
            Bulanan
          </button>
        </div>
      </div>

      {/* Divider */}
      <div className="mb-4 h-px bg-[#E5E7EB] sm:mb-6" />

      {/* Chart */}
      <div className="h-[220px] flex-1 sm:h-[280px] lg:h-[340px]">
        {hasData ? (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={weeklyData}>
              <CartesianGrid
                strokeDasharray="0"
                stroke="#E5E7EB"
                vertical={false}
              />
              <XAxis
                dataKey="day"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: "#565F6B", fontWeight: 500 }}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: "#565F6B" }}
                allowDecimals={false}
              />
              <Tooltip
                contentStyle={{
                  borderRadius: "8px",
                  border: "1px solid #E5E7EB",
                  boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
                  fontSize: "12px",
                }}
                labelStyle={{ fontWeight: 600 }}
              />
              <Bar
                dataKey="count"
                fill="#0055D4"
                radius={[4, 4, 0, 0]}
                name="Pengumpulan"
                background={{ fill: "#EFF6FF", radius: [8, 8, 0, 0] as unknown as number }}
              />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex h-full flex-col items-center justify-center text-center">
            <p className="text-sm text-[#8C8D91]">
              Belum ada data pengumpulan tugas
            </p>
            <p className="mt-1 text-xs text-[#B0B3BE]">
              Data akan muncul saat siswa mulai mengumpulkan tugas
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
