"use client";

import { AssignmentSidebarItem } from "./assignment-sidebar-item";
import type { AssignmentWithGradingProgress } from "@/lib/api/submissions";

interface AssignmentListPanelProps {
  assignments: AssignmentWithGradingProgress[];
  selectedAssignmentId: string | null;
  onSelectAssignment: (id: string) => void;
}

export function AssignmentListPanel({
  assignments,
  selectedAssignmentId,
  onSelectAssignment,
}: AssignmentListPanelProps) {
  return (
    <div className="w-[256px] shrink-0 border-r border-[#F1F5F9] bg-[#FCFDFE] p-3">
      <div className="flex flex-col gap-3">
        {assignments.map((assignment) => (
          <AssignmentSidebarItem
            key={assignment.id}
            title={assignment.title}
            gradedCount={assignment.gradedCount}
            totalStudents={assignment.totalStudents}
            isSelected={selectedAssignmentId === assignment.id}
            onClick={() => onSelectAssignment(assignment.id)}
          />
        ))}
        {assignments.length === 0 && (
          <p className="px-4 py-8 text-center text-sm text-[#94A3B8]">
            No assignments yet
          </p>
        )}
      </div>
    </div>
  );
}
