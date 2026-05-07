"use client";

import { useEffect, useState } from "react";
import { StudentGradingRow } from "./student-grading-row";
import {
  fetchStudentSubmissions,
  type StudentSubmissionStatus,
  type AssignmentWithGradingProgress,
} from "@/lib/api/submissions";

interface StudentListPanelProps {
  assignment: AssignmentWithGradingProgress | null;
  classId: string;
}

export function StudentListPanel({ assignment, classId }: StudentListPanelProps) {
  const [students, setStudents] = useState<StudentSubmissionStatus[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!assignment) return;

    setLoading(true);
    fetchStudentSubmissions(assignment.id, classId)
      .then(setStudents)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [assignment, classId]);

  if (!assignment) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <p className="text-sm text-[#94A3B8]">Select an assignment to view students</p>
      </div>
    );
  }

  // Format deadline
  const formatDeadline = (deadline: string | null) => {
    if (!deadline) return null;
    const date = new Date(deadline);
    const months = [
      "Januari", "Februari", "Maret", "April", "Mei", "Juni",
      "Juli", "Agustus", "September", "Oktober", "November", "Desember",
    ];
    return `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`;
  };

  return (
    <div className="flex-1 px-6 py-6">
      {/* Header */}
      <div className="mb-4 flex items-center gap-4">
        <h3 className="text-xl text-[#191B23]">
          {assignment.title} : Student List
        </h3>
        {assignment.deadline && (
          <div className="rounded-full bg-[#FFDBCF] px-4 py-2">
            <span className="text-xs text-[#380C00]">
              DUE: &nbsp;{formatDeadline(assignment.deadline)}
            </span>
          </div>
        )}
      </div>

      {/* Student List */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-[#2563EB] border-t-transparent" />
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {students.map((studentData) => (
            <StudentGradingRow key={studentData.student.id} data={studentData} />
          ))}
          {students.length === 0 && (
            <p className="py-8 text-center text-sm text-[#94A3B8]">
              No students in this class
            </p>
          )}
        </div>
      )}
    </div>
  );
}
