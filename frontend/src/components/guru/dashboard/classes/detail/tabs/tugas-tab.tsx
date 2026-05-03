"use client";

import { useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AssignmentCard } from "../tugas/assignment-card";
import { AssignmentsTable } from "../tugas/assignments-table";
import { FabButton } from "../tugas/fab-button";
import { CreateAssignmentModal } from "../tugas/create-assignment-modal";
import { ResultAlert } from "../result-alert";
import {
  type Assignment,
  deleteAssignment,
  getSubmissionCount,
} from "@/lib/api/assignments";
import type { Student } from "@/lib/api/class-detail";

interface TugasTabProps {
  classId: string;
  className: string;
  subjectName?: string;
  assignments: Assignment[];
  students: Student[];
}

type AlertState = {
  variant: "success" | "error";
  title: string;
  description: string;
} | null;

export function TugasTab({
  classId,
  className,
  subjectName,
  assignments,
  students,
}: TugasTabProps) {
  const queryClient = useQueryClient();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [alert, setAlert] = useState<AlertState>(null);
  const [submissionCounts, setSubmissionCounts] = useState<
    Record<string, number>
  >({});

  // Fetch submission counts for all assignments
  useEffect(() => {
    async function loadCounts() {
      const counts: Record<string, number> = {};
      for (const a of assignments) {
        counts[a.id] = await getSubmissionCount(a.id);
      }
      setSubmissionCounts(counts);
    }
    if (assignments.length > 0) loadCounts();
  }, [assignments]);

  const deleteMutation = useMutation({
    mutationFn: deleteAssignment,
    onSuccess: (_data, deletedId) => {
      queryClient.setQueryData<Assignment[]>(
        ["assignments", classId],
        (old) => (old ? old.filter((a) => a.id !== deletedId) : [])
      );
    },
  });

  const totalStudents = students.length;

  return (
    <>
      {/* Assignment Cards Row */}
      {assignments.length > 0 && (
        <div className="flex gap-3 overflow-x-auto pb-2">
          {assignments.map((a) => (
            <AssignmentCard
              key={a.id}
              title={a.title}
              description={a.description}
              submittedCount={submissionCounts[a.id] || 0}
              totalStudents={totalStudents}
            />
          ))}
        </div>
      )}

      {/* Assignments Table */}
      <AssignmentsTable
        assignments={assignments}
        totalStudents={totalStudents}
        submissionCounts={submissionCounts}
        onDelete={(id) => deleteMutation.mutate(id)}
      />

      {/* FAB Button */}
      <FabButton onClick={() => setShowCreateModal(true)} />

      {/* Create Assignment Modal */}
      {showCreateModal && (
        <CreateAssignmentModal
          classId={classId}
          className={className}
          subjectName={subjectName}
          students={students}
          onClose={() => setShowCreateModal(false)}
          onSuccess={() =>
            setAlert({
              variant: "success",
              title: "Tugas berhasil dibuat",
              description:
                "Bot WA akan mengirim notifikasi tugas ke semua siswa di kelas ini",
            })
          }
          onError={() =>
            setAlert({
              variant: "error",
              title: "Tugas Gagal dibuat",
              description: "Coba lagi. Periksa koneksi anda.",
            })
          }
        />
      )}

      {/* Result Alert */}
      {alert && (
        <ResultAlert
          variant={alert.variant}
          title={alert.title}
          description={alert.description}
          buttonText="Kembali"
          onClose={() => setAlert(null)}
        />
      )}
    </>
  );
}
