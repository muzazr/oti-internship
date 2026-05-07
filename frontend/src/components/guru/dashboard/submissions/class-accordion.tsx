"use client";

import { useState } from "react";
import { AssignmentListPanel } from "./assignment-list-panel";
import { StudentListPanel } from "./student-list-panel";
import type { ClassWithAssignments } from "@/lib/api/submissions";

interface ClassAccordionProps {
  classData: ClassWithAssignments;
  defaultExpanded?: boolean;
}

export function ClassAccordion({
  classData,
  defaultExpanded = false,
}: ClassAccordionProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  const [selectedAssignmentId, setSelectedAssignmentId] = useState<string | null>(
    classData.assignments.length > 0 ? classData.assignments[0].id : null
  );

  const pendingCount = classData.assignments.filter(
    (a) => a.gradedCount < a.totalStudents
  ).length;

  const selectedAssignment =
    classData.assignments.find((a) => a.id === selectedAssignmentId) || null;

  const subtitleText = classData.assignments.length === 0
    ? "No Assignments"
    : pendingCount > 0
    ? `${classData.assignments.length} Assignments Pending`
    : `${classData.assignments.length} Assignments`;

  return (
    <div className="overflow-hidden rounded-xl border border-[#F1F5F9] bg-white">
      {/* Accordion Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className={`flex w-full items-center gap-4 px-6 transition-colors ${
          isExpanded ? "bg-[#F7FAFF] py-[26px]" : "bg-white py-[26px] hover:bg-[#FAFBFC]"
        }`}
      >
        <span
          className={`material-icons text-2xl ${
            isExpanded ? "text-[#003FA3]" : "text-[#94A3B8]"
          }`}
        >
          {isExpanded ? "expand_less" : "expand_more"}
        </span>
        <div className="flex flex-col items-start">
          <span className="text-xl font-bold text-[#003FA3]">
            {classData.name}
          </span>
          <span className="text-xs text-[#565F6B]">
            {classData.subject_name || "Subject"} - {subtitleText}
          </span>
        </div>
      </button>

      {/* Accordion Body */}
      {isExpanded && classData.assignments.length > 0 && (
        <div className="flex border-t border-[#F1F5F9]">
          {/* Left: Assignment List */}
          <AssignmentListPanel
            assignments={classData.assignments}
            selectedAssignmentId={selectedAssignmentId}
            onSelectAssignment={setSelectedAssignmentId}
          />

          {/* Right: Student List */}
          <StudentListPanel
            assignment={selectedAssignment}
            classId={classData.id}
          />
        </div>
      )}

      {/* Empty state when expanded but no assignments */}
      {isExpanded && classData.assignments.length === 0 && (
        <div className="border-t border-[#F1F5F9] px-6 py-12 text-center">
          <p className="text-sm text-[#94A3B8]">
            No assignments for this class yet
          </p>
        </div>
      )}
    </div>
  );
}
