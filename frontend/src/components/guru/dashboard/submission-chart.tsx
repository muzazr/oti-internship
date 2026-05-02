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

  return (
    <div className="bg-white rounded-xl border border-[#F9FAFB] shadow-[0_4px_4px_rgba(0,0,0,0.05)] p-6 flex-1 min-w-0">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-[#191B23]">
          Tren Pengumpulan Tugas
        </h3>
        <div className="flex items-center">
          <button
            onClick={() => setActiveTab("weekly")}
            className={`px-4 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
              activeTab === "weekly"
                ? "bg-[#DAE2FF] text-[#003FA3]"
                : "text-[#565F6B] hover:bg-[#F9FAFB]"
            }`}
          >
            Mingguan
          </button>
          <button
            onClick={() => setActiveTab("monthly")}
            className={`px-4 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
              activeTab === "monthly"
                ? "bg-[#DAE2FF] text-[#003FA3]"
                : "text-[#565F6B] hover:bg-[#F9FAFB]"
            }`}
          >
            Bulanan
          </button>
        </div>
      </div>

      {/* Divider */}
      <div className="h-px bg-[#E5E7EB] mb-6" />

      {/* Chart */}
      <div className="h-[340px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={weeklyData} barSize={53}>
            <CartesianGrid
              strokeDasharray="0"
              stroke="#E5E7EB"
              vertical={false}
            />
            <XAxis
              dataKey="day"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: "#565F6B" }}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: "#565F6B" }}
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
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
