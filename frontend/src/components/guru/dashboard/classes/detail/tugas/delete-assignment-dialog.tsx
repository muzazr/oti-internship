"use client";

import { useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AlertTriangle, Loader2 } from "lucide-react";
import { deleteAssignment, type Assignment } from "@/lib/api/assignments";

interface DeleteAssignmentDialogProps {
  classId: string;
  assignmentId: string;
  onClose: () => void;
}

export function DeleteAssignmentDialog({
  classId,
  assignmentId,
  onClose,
}: DeleteAssignmentDialogProps) {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: () => deleteAssignment(assignmentId),
    onSuccess: () => {
      // Remove from cache immediately
      queryClient.setQueryData<Assignment[]>(
        ["assignments", classId],
        (old) => (old ? old.filter((a) => a.id !== assignmentId) : [])
      );
      onClose();
    },
  });

  // Close on Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !mutation.isPending) onClose();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose, mutation.isPending]);

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50"
      onClick={(e) =>
        e.target === e.currentTarget && !mutation.isPending && onClose()
      }
      role="dialog"
      aria-modal="true"
    >
      <div className="w-[448px] bg-white border border-[#F1F5F9] rounded-xl p-8 flex flex-col items-center gap-6">
        {/* Warning Icon */}
        <div className="w-16 h-16 bg-[#FEF2F2] rounded-full flex items-center justify-center">
          <AlertTriangle className="w-9 h-9 text-[#DC2626]" />
        </div>

        {/* Title */}
        <h2 className="text-2xl font-bold text-[#191B23] text-center">
          Yakin, Hapus Tugas ini ?
        </h2>

        {/* Description */}
        <p className="text-base text-[#475569] text-center leading-relaxed px-3">
          Tugas akan dihapus secara permanen. Mohon Periksa Kembali Tugas Anda.
        </p>

        {/* Error Message */}
        {mutation.isError && (
          <p className="text-xs text-[#BA1A1A] text-center">
            {mutation.error?.message ||
              "Gagal menghapus tugas. Silakan coba lagi."}
          </p>
        )}

        {/* Buttons — Hapus (left) + Batal (right) */}
        <div className="flex gap-3 w-full">
          <button
            type="button"
            onClick={() => mutation.mutate()}
            disabled={mutation.isPending}
            className="flex-1 h-12 bg-[#BA1A1A] rounded-xl text-base text-white hover:bg-[#9A1515] transition-colors cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {mutation.isPending && (
              <Loader2 className="w-4 h-4 animate-spin" />
            )}
            Hapus
          </button>
          <button
            type="button"
            onClick={onClose}
            disabled={mutation.isPending}
            className="flex-1 h-12 bg-white border border-[#E2E8F0] rounded-xl text-base text-[#475569] hover:bg-gray-50 transition-colors cursor-pointer disabled:opacity-50"
          >
            Batal
          </button>
        </div>
      </div>
    </div>
  );
}
