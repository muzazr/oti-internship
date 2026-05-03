"use client";

import { Users } from "lucide-react";
import { MemberRow } from "../member-row";
import type { TeacherProfile } from "@/lib/api/class-detail";

interface TeachersSectionProps {
  teacher: TeacherProfile | null;
}

export function TeachersSection({ teacher }: TeachersSectionProps) {
  const teacherCount = teacher ? 1 : 0;

  return (
    <div className="bg-white rounded-xl overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-3 px-5 py-4 bg-[#EDEDF8]">
        <Users className="w-6 h-6 text-[#003FA3]" />
        <span className="text-xl text-[#191B23]">Teachers</span>
        <span className="ml-auto px-3 py-0.5 bg-[#E5ECF6] rounded-full text-xs text-[#003FA3]">
          {teacherCount} Members
        </span>
      </div>

      {/* Teacher Rows */}
      {teacher && (
        <MemberRow
          name={teacher.full_name}
          subtitle={`Guru`}
          variant="teacher"
        />
      )}

      {!teacher && (
        <div className="px-5 py-6 text-sm text-[#64748B] text-center">
          Tidak ada data guru
        </div>
      )}
    </div>
  );
}
