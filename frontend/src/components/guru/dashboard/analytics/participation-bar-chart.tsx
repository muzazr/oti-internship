"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";

interface ParticipationData {
  assignment: string;
  sudah: number;
  terlambat: number;
  belum: number;
}

interface ParticipationBarChartProps {
  data: ParticipationData[];
}

const COLORS = {
  sudah: "#16A34A",
  terlambat: "#D97706",
  belum: "#E11D48",
};

export function ParticipationBarChart({ data }: ParticipationBarChartProps) {
  const hasData = data.length > 0 && data.some((d) => d.sudah + d.terlambat + d.belum > 0);

  return (
    <div className="flex min-w-0 flex-[3] flex-col rounded-xl border border-[#F9FAFB] bg-white p-4 shadow-[0_4px_4px_rgba(0,0,0,0.05)] sm:p-6">
      {/* Header */}
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-lg font-bold text-[#191B23] sm:text-xl">
          Grafik Partisipasi Per Tugas
        </h3>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <div
              className="h-3 w-3 rounded-sm"
              style={{ backgroundColor: COLORS.sudah }}
            />
            <span className="text-xs font-medium text-[#565F6B]">Sudah</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div
              className="h-3 w-3 rounded-sm"
              style={{ backgroundColor: COLORS.terlambat }}
            />
            <span className="text-xs font-medium text-[#565F6B]">
              Terlambat
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <div
              className="h-3 w-3 rounded-sm"
              style={{ backgroundColor: COLORS.belum }}
            />
            <span className="text-xs font-medium text-[#565F6B]">Belum</span>
          </div>
        </div>
      </div>

      {/* Divider */}
      <div className="mb-4 h-px bg-[#E5E7EB] sm:mb-6" />

      {/* Chart */}
      <div className="h-[220px] flex-1 sm:h-[280px] lg:h-[340px]">
        {hasData ? (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} barCategoryGap="20%">
              <CartesianGrid
                strokeDasharray="0"
                stroke="#E5E7EB"
                vertical={false}
              />
              <XAxis
                dataKey="assignment"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 11, fill: "#565F6B", fontWeight: 500 }}
                interval={0}
                angle={-15}
                textAnchor="end"
                height={50}
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
                labelStyle={{ fontWeight: 600, marginBottom: 4 }}
              />
              <Legend content={() => null} />
              <Bar
                dataKey="sudah"
                stackId="a"
                fill={COLORS.sudah}
                radius={[0, 0, 0, 0]}
                name="Sudah"
              />
              <Bar
                dataKey="terlambat"
                stackId="a"
                fill={COLORS.terlambat}
                radius={[0, 0, 0, 0]}
                name="Terlambat"
              />
              <Bar
                dataKey="belum"
                stackId="a"
                fill={COLORS.belum}
                radius={[4, 4, 0, 0]}
                name="Belum"
              />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex h-full flex-col items-center justify-center text-center">
            <p className="text-sm text-[#8C8D91]">
              Belum ada data partisipasi
            </p>
            <p className="mt-1 text-xs text-[#B0B3BE]">
              Data akan muncul saat tugas dibuat dan siswa mulai mengumpulkan
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
