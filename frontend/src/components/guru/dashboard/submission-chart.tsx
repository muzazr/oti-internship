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
  Cell,
} from "recharts";

interface SubmissionChartProps {
  weeklyData: Array<{ day: string; count: number }>;
}

export function SubmissionChart({ weeklyData }: SubmissionChartProps) {
  const [activeTab, setActiveTab] = useState<"weekly" | "monthly">("weekly");

  return (
    <div className="flex min-w-0 flex-1 flex-col rounded-xl border border-[#F9FAFB] bg-white p-6 shadow-[0_4px_4px_rgba(0,0,0,0.05)]">
      {/* Header */}
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-xl font-bold text-[#191B23]">
          Tren Pengumpulan Tugas
        </h3>
        <div className="flex items-center">
          <button
            onClick={() => setActiveTab("weekly")}
            className={`cursor-pointer rounded-lg px-4 py-1.5 text-xs font-bold transition-colors ${
              activeTab === "weekly"
                ? "bg-[#DAE2FF] text-[#003FA3]"
                : "text-[#565F6B] hover:bg-[#F9FAFB]"
            }`}
          >
            Mingguan
          </button>
          <button
            onClick={() => setActiveTab("monthly")}
            className={`cursor-pointer rounded-lg px-4 py-1.5 text-xs font-medium transition-colors ${
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
      <div className="mb-6 h-px bg-[#E5E7EB]" />

      {/* Chart */}
      <div className="h-[340px] flex-1">
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
              tick={{ fontSize: 12, fill: "#565F6B", fontWeight: 500 }}
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
              background={{ fill: "#EFF6FF", radius: [8, 8, 0, 0] as unknown as number }}
            >
              {weeklyData.map((_, index) => (
                <Cell key={`cell-${index}`} fill="#0055D4" />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
