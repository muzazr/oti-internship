"use client";

import { useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { AlertTriangle, Loader2 } from "lucide-react";
import { deleteClass } from "@/lib/api/classes";

interface DeleteClassDialogProps {
  classId: string;
  classTitle: string;
  onClose: () => void;
  onDeleted: () => void;
}

export function DeleteClassDialog({
  classId,
  classTitle,
  onClose,
  onDeleted,
}: DeleteClassDialogProps) {
  const mutation = useMutation({
    mutationFn: () => deleteClass(classId),
    onSuccess: () => {
      onDeleted();
    },
  });

  // Close on Escape key
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
      aria-labelledby="delete-class-title"
    >
      <div className="w-[480px] bg-white border border-[#F1F5F9] rounded-xl p-8 flex flex-col items-center gap-8">
        {/* Warning Icon */}
        <div className="w-16 h-16 bg-[#FFDAD6] rounded-full flex items-center justify-center">
          <AlertTriangle className="w-8 h-8 text-[#BA1A1A]" />
        </div>

        {/* Title */}
        <h2
          id="delete-class-title"
          className="text-2xl font-bold text-[#191B23] text-center"
        >
          Yakin Hapus Kelas Ini ?
        </h2>

        {/* Description */}
        <p className="text-sm text-[#475569] text-center leading-relaxed">
          Seluruh data penugasan dan nilai dalam kelas{" "}
          <strong>{classTitle}</strong> akan dihapus secara permanen dan tidak
          dapat dikembalikan.
        </p>

        {/* Error Message */}
        {mutation.isError && (
          <p className="text-xs text-[#BA1A1A] text-center">
            {mutation.error?.message ||
              "Gagal menghapus kelas. Silakan coba lagi."}
          </p>
        )}

        {/* Buttons */}
        <div className="flex gap-4 w-full">
          <button
            type="button"
            onClick={onClose}
            disabled={mutation.isPending}
            className="flex-1 h-12 border border-[#E2E8F0] rounded-xl text-base text-[#475569] hover:bg-gray-50 transition-colors cursor-pointer disabled:opacity-50"
          >
            Batal
          </button>
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
        </div>
      </div>
    </div>
  );
}
