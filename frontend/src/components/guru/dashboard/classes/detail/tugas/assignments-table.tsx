"use client";

import { Pencil, Trash2, ChevronRight } from "lucide-react";
import type { Assignment } from "@/lib/api/assignments";

interface AssignmentsTableProps {
  assignments: Assignment[];
  totalStudents: number;
  submissionCounts: Record<string, number>;
  onEdit: (assignment: Assignment) => void;
  onDelete: (assignmentId: string) => void;
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return "-";
  return new Date(dateStr).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function getStatus(
  submittedCount: number,
  totalStudents: number
): "completed" | "in_progress" {
  if (totalStudents > 0 && submittedCount >= totalStudents) return "completed";
  return "in_progress";
}

export function AssignmentsTable({
  assignments,
  totalStudents,
  submissionCounts,
  onEdit,
  onDelete,
}: AssignmentsTableProps) {
  return (
    <div className="bg-white rounded-xl overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4">
        <h3 className="text-xl font-bold text-[#191B23]">
          Manage Class Assignments
        </h3>
        <button className="flex items-center gap-1 text-sm text-[#2563EB] hover:underline cursor-pointer">
          View All Tasks
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Table */}
      <table className="w-full">
        <thead>
          <tr className="bg-[#FCFDFE] border-y border-[#F1F5F9]">
            <th className="text-left text-xs font-normal text-[#64748B] px-5 py-3 w-[100px]">
              Status
            </th>
            <th className="text-left text-xs font-normal text-[#64748B] px-3 py-3">
              Assignment Name
            </th>
            <th className="text-left text-xs font-normal text-[#64748B] px-3 py-3 w-[150px]">
              Starting Date
            </th>
            <th className="text-left text-xs font-normal text-[#64748B] px-3 py-3 w-[150px]">
              Deadline
            </th>
            <th className="text-left text-xs font-normal text-[#64748B] px-3 py-3 w-[80px]">
              Action
            </th>
          </tr>
        </thead>
        <tbody>
          {assignments.length === 0 && (
            <tr>
              <td
                colSpan={5}
                className="text-center text-sm text-[#64748B] py-8"
              >
                Belum ada tugas di kelas ini
              </td>
            </tr>
          )}
          {assignments.map((assignment) => {
            const submitted = submissionCounts[assignment.id] || 0;
            const status = getStatus(submitted, totalStudents);

            return (
              <tr
                key={assignment.id}
                className="border-t border-[#F1F5F9] hover:bg-gray-50"
              >
                {/* Status Badge */}
                <td className="px-5 py-3">
                  {status === "completed" ? (
                    <span className="inline-block px-3 py-1 bg-[#10B981] text-[#D1FAE5] text-xs rounded-full">
                      Completed
                    </span>
                  ) : (
                    <span className="inline-block px-3 py-1 bg-[#EFF6FF] text-[#2563EB] text-xs rounded-full">
                      In Progress
                    </span>
                  )}
                </td>

                {/* Name */}
                <td className="px-3 py-3 text-sm text-[#191B23]">
                  {assignment.title}
                </td>

                {/* Starting Date */}
                <td className="px-3 py-3 text-sm text-[#64748B]">
                  {formatDate(assignment.start_date)}
                </td>

                {/* Deadline */}
                <td className="px-3 py-3 text-sm text-[#64748B]">
                  {formatDate(assignment.deadline)}
                </td>

                {/* Actions */}
                <td className="px-3 py-3">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onEdit(assignment)}
                      className="p-1 text-[#94A3B8] hover:text-[#2563EB] transition-colors cursor-pointer"
                    >
                      <Pencil className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => onDelete(assignment.id)}
                      className="p-1 text-[#94A3B8] hover:text-[#BA1A1A] transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
