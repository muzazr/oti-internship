"use client";

import { Info } from "lucide-react";

interface ClassStatisticsProps {
  studentCount: number;
  teacherCount: number;
}

export function ClassStatistics({
  studentCount,
  teacherCount,
}: ClassStatisticsProps) {
  return (
    <div className="bg-[#F2F6FB] border border-[#E6ECF6] rounded-xl p-5 w-[325px]">
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <Info className="w-6 h-6 text-[#003FA3]" />
        <span className="text-base text-[#003FA3]">Class Statistics</span>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-white rounded-lg p-3 text-center">
          <p className="text-xs text-[#424654]">Students</p>
          <p className="text-xl text-[#191B23]">{studentCount}</p>
        </div>
        <div className="bg-white rounded-lg p-3 text-center">
          <p className="text-xs text-[#424654]">Teachers</p>
          <p className="text-xl text-[#191B23]">{teacherCount}</p>
        </div>
      </div>
    </div>
  );
}
