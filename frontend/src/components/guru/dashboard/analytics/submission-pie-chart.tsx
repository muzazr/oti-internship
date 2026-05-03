"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";

interface SubmissionPieChartProps {
  submitted: number;
  late: number;
  notSubmitted: number;
}

const COLORS = {
  sudah: "#16A34A",
  terlambat: "#D97706",
  belum: "#E11D48",
};

export function SubmissionPieChart({
  submitted,
  late,
  notSubmitted,
}: SubmissionPieChartProps) {
  const total = submitted + late + notSubmitted;
  const submittedPct = total > 0 ? Math.round((submitted / total) * 100) : 0;
  const latePct = total > 0 ? Math.round((late / total) * 100) : 0;
  const notSubmittedPct = total > 0 ? Math.round((notSubmitted / total) * 100) : 0;

  const data = [
    { name: "Sudah", value: submitted, color: COLORS.sudah, percentage: submittedPct },
    { name: "Terlambat", value: late, color: COLORS.terlambat, percentage: latePct },
    { name: "Belum", value: notSubmitted, color: COLORS.belum, percentage: notSubmittedPct },
  ];

  const hasData = total > 0;

  return (
    <div className="flex min-w-0 flex-[2] flex-col rounded-xl border border-[#F9FAFB] bg-white p-4 shadow-[0_4px_4px_rgba(0,0,0,0.05)] sm:p-6">
      {/* Header */}
      <div className="mb-4">
        <h3 className="text-lg font-bold text-[#191B23] sm:text-xl">
          Status Pengumpulan
        </h3>
      </div>

      {/* Divider */}
      <div className="mb-4 h-px bg-[#E5E7EB] sm:mb-6" />

      {/* Chart */}
      <div className="flex flex-1 flex-col items-center justify-center">
        {hasData ? (
          <>
            <div className="relative h-[200px] w-[200px] sm:h-[240px] sm:w-[240px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={3}
                    dataKey="value"
                    strokeWidth={0}
                  >
                    {data.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      borderRadius: "8px",
                      border: "1px solid #E5E7EB",
                      boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
                      fontSize: "12px",
                    }}
                    formatter={(value, name) => [
                      `${value} siswa`,
                      `${name}`,
                    ]}
                  />
                </PieChart>
              </ResponsiveContainer>
              {/* Center label */}
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-2xl font-black text-[#191B23]">
                  {submittedPct + latePct}%
                </span>
                <span className="text-xs font-medium text-[#565F6B]">
                  Terkumpul
                </span>
              </div>
            </div>

            {/* Legend */}
            <div className="mt-4 flex flex-wrap items-center justify-center gap-4 sm:gap-6">
              {data.map((item) => (
                <div key={item.name} className="flex items-center gap-2">
                  <div
                    className="h-3 w-3 rounded-full"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="text-xs font-medium text-[#565F6B]">
                    {item.name}
                  </span>
                  <span className="text-xs font-bold text-[#191B23]">
                    {item.percentage}%
                  </span>
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className="flex h-full flex-col items-center justify-center text-center py-12">
            <p className="text-sm text-[#8C8D91]">
              Belum ada data pengumpulan
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
