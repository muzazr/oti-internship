"use client";

import { useState } from "react";
import { Users, Search } from "lucide-react";
import { MemberRow } from "../member-row";
import type { Student } from "@/lib/api/class-detail";

interface StudentsSectionProps {
  students: Student[];
  onDeleteStudent?: (studentId: string) => void;
}

export function StudentsSection({
  students,
  onDeleteStudent,
}: StudentsSectionProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredStudents = students.filter((s) =>
    s.full_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="bg-white rounded-xl overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-3 px-5 py-4 bg-[#EDEDF8] border-b border-[#C3C6D7]">
        <Users className="w-6 h-6 text-[#191B23]" />
        <span className="text-xl text-[#191B23]">Students</span>

        {/* Search */}
        <div className="ml-auto flex items-center gap-2 bg-white border border-[#C3C6D7] rounded-full px-3 py-1.5 w-[192px]">
          <Search className="w-4 h-4 text-[#424654] flex-shrink-0" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search students..."
            className="flex-1 bg-transparent text-xs text-[#191B23] placeholder:text-[#8C8D91] outline-none"
          />
        </div>

        <span className="text-xs text-[#424654]">
          {students.length} Students
        </span>
      </div>

      {/* Student Rows */}
      {filteredStudents.length > 0 ? (
        filteredStudents.map((student) => (
          <MemberRow
            key={student.id}
            name={student.full_name}
            subtitle={`Siswa${student.whatsapp_number ? ` - ${student.whatsapp_number}` : ""}`}
            variant="student"
            onAction={
              onDeleteStudent
                ? () => onDeleteStudent(student.id)
                : undefined
            }
          />
        ))
      ) : (
        <div className="px-5 py-6 text-sm text-[#64748B] text-center">
          {searchQuery
            ? "Tidak ada siswa yang cocok"
            : "Belum ada siswa di kelas ini"}
        </div>
      )}
    </div>
  );
}
