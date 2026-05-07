"use client";

import { useState, useMemo } from "react";
import { Search, ArrowUpDown } from "lucide-react";

interface StudentRecap {
  id: string;
  name: string;
  avgScore: number;
  submitted: number;
  late: number;
  notSubmitted: number;
}

interface StudentRecapTableProps {
  students: StudentRecap[];
}

type SortField = "name" | "avgScore" | "submitted" | "late" | "notSubmitted";
type SortDirection = "asc" | "desc";

function getStatus(student: StudentRecap): {
  label: string;
  bgColor: string;
  textColor: string;
} {
  if (student.avgScore < 60 || student.notSubmitted > 2) {
    return {
      label: "Kritis",
      bgColor: "#FFF1F2",
      textColor: "#E11D48",
    };
  }
  if (student.late > 0 || student.notSubmitted > 0) {
    return {
      label: "Perlu Perhatian",
      bgColor: "#FFFBEB",
      textColor: "#D97706",
    };
  }
  return {
    label: "Baik",
    bgColor: "#ECFDF5",
    textColor: "#059669",
  };
}

export function StudentRecapTable({ students }: StudentRecapTableProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [sortField, setSortField] = useState<SortField>("name");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection(field === "name" ? "asc" : "desc");
    }
  };

  const filteredAndSorted = useMemo(() => {
    let result = [...students];

    // Filter by search
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter((s) => s.name.toLowerCase().includes(query));
    }

    // Sort
    result.sort((a, b) => {
      let comparison = 0;
      if (sortField === "name") {
        comparison = a.name.localeCompare(b.name);
      } else {
        comparison = a[sortField] - b[sortField];
      }
      return sortDirection === "asc" ? comparison : -comparison;
    });

    return result;
  }, [students, searchQuery, sortField, sortDirection]);

  return (
    <div className="rounded-xl border border-[#F9FAFB] bg-white p-4 shadow-[0_4px_4px_rgba(0,0,0,0.05)] sm:p-6">
      {/* Header */}
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h3 className="text-lg font-bold text-[#191B23] sm:text-xl">
          Rekap Individu Siswa
        </h3>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9CA3AF]" />
          <input
            type="text"
            placeholder="Cari siswa..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-lg border border-[#E5E7EB] py-2 pl-9 pr-3 text-sm text-[#191B23] placeholder-[#9CA3AF] outline-none transition-colors focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB] sm:w-[220px]"
          />
        </div>
      </div>

      {/* Divider */}
      <div className="mb-4 h-px bg-[#E5E7EB]" />

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full min-w-[640px]">
          <thead>
            <tr className="border-b border-[#F3F4F6]">
              <th className="px-3 py-3 text-left text-xs font-bold text-[#565F6B]">
                No
              </th>
              <th className="px-3 py-3 text-left text-xs font-bold text-[#565F6B]">
                <button
                  onClick={() => handleSort("name")}
                  className="flex cursor-pointer items-center gap-1 hover:text-[#191B23]"
                >
                  Nama Siswa
                  <ArrowUpDown className="h-3 w-3" />
                </button>
              </th>
              <th className="px-3 py-3 text-center text-xs font-bold text-[#565F6B]">
                <button
                  onClick={() => handleSort("avgScore")}
                  className="flex cursor-pointer items-center gap-1 hover:text-[#191B23]"
                >
                  Rata-rata
                  <ArrowUpDown className="h-3 w-3" />
                </button>
              </th>
              <th className="px-3 py-3 text-center text-xs font-bold text-[#565F6B]">
                <button
                  onClick={() => handleSort("submitted")}
                  className="flex cursor-pointer items-center gap-1 hover:text-[#191B23]"
                >
                  Sudah
                  <ArrowUpDown className="h-3 w-3" />
                </button>
              </th>
              <th className="px-3 py-3 text-center text-xs font-bold text-[#565F6B]">
                <button
                  onClick={() => handleSort("late")}
                  className="flex cursor-pointer items-center gap-1 hover:text-[#191B23]"
                >
                  Terlambat
                  <ArrowUpDown className="h-3 w-3" />
                </button>
              </th>
              <th className="px-3 py-3 text-center text-xs font-bold text-[#565F6B]">
                <button
                  onClick={() => handleSort("notSubmitted")}
                  className="flex cursor-pointer items-center gap-1 hover:text-[#191B23]"
                >
                  Belum
                  <ArrowUpDown className="h-3 w-3" />
                </button>
              </th>
              <th className="px-3 py-3 text-center text-xs font-bold text-[#565F6B]">
                Status
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredAndSorted.length > 0 ? (
              filteredAndSorted.map((student, index) => {
                const status = getStatus(student);
                return (
                  <tr
                    key={student.id}
                    className={`border-b border-[#F9FAFB] transition-colors hover:bg-[#FAFBFC] ${
                      index % 2 === 1 ? "bg-[#FAFBFC]" : ""
                    }`}
                  >
                    <td className="px-3 py-3 text-sm text-[#565F6B]">
                      {index + 1}
                    </td>
                    <td className="px-3 py-3 text-sm font-medium text-[#191B23]">
                      {student.name}
                    </td>
                    <td className="px-3 py-3 text-center text-sm font-semibold text-[#191B23]">
                      {student.avgScore.toFixed(1)}
                    </td>
                    <td className="px-3 py-3 text-center text-sm text-[#059669] font-medium">
                      {student.submitted}
                    </td>
                    <td className="px-3 py-3 text-center text-sm text-[#D97706] font-medium">
                      {student.late}
                    </td>
                    <td className="px-3 py-3 text-center text-sm text-[#E11D48] font-medium">
                      {student.notSubmitted}
                    </td>
                    <td className="px-3 py-3 text-center">
                      <span
                        className="inline-block rounded-full px-2.5 py-1 text-xs font-bold"
                        style={{
                          backgroundColor: status.bgColor,
                          color: status.textColor,
                        }}
                      >
                        {status.label}
                      </span>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td
                  colSpan={7}
                  className="px-3 py-8 text-center text-sm text-[#8C8D91]"
                >
                  {searchQuery
                    ? "Tidak ada siswa yang cocok dengan pencarian"
                    : "Belum ada data siswa"}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Footer */}
      {filteredAndSorted.length > 0 && (
        <div className="mt-4 text-xs text-[#8C8D91]">
          Menampilkan {filteredAndSorted.length} dari {students.length} siswa
        </div>
      )}
    </div>
  );
}
