"use client";

import { useEffect, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { X, Loader2, Calendar } from "lucide-react";
import { updateAssignment, type Assignment } from "@/lib/api/assignments";

interface EditAssignmentModalProps {
  classId: string;
  className: string;
  subjectName?: string;
  assignment: Assignment;
  onClose: () => void;
}

function toDateInputValue(isoStr: string | null): string {
  if (!isoStr) return "";
  return new Date(isoStr).toISOString().split("T")[0];
}

export function EditAssignmentModal({
  classId,
  className,
  subjectName,
  assignment,
  onClose,
}: EditAssignmentModalProps) {
  const queryClient = useQueryClient();
  const [title, setTitle] = useState(assignment.title);
  const [description, setDescription] = useState(assignment.description || "");
  const [attachmentUrl, setAttachmentUrl] = useState(
    assignment.attachment_url || ""
  );
  const [startDate, setStartDate] = useState(
    toDateInputValue(assignment.start_date)
  );
  const [deadline, setDeadline] = useState(
    toDateInputValue(assignment.deadline)
  );

  const mutation = useMutation({
    mutationFn: async () => {
      return updateAssignment(assignment.id, {
        title,
        description: description || undefined,
        attachment_url: attachmentUrl || undefined,
        start_date: startDate ? new Date(startDate).toISOString() : undefined,
        deadline: deadline ? new Date(deadline).toISOString() : undefined,
      });
    },
    onSuccess: (updatedAssignment) => {
      queryClient.setQueryData<Assignment[]>(
        ["assignments", classId],
        (old) =>
          old
            ? old.map((a) =>
                a.id === updatedAssignment.id ? updatedAssignment : a
              )
            : []
      );
      onClose();
    },
  });

  // Close on Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50"
      onClick={(e) => e.target === e.currentTarget && onClose()}
      role="dialog"
      aria-modal="true"
    >
      <div className="w-[1001px] bg-white rounded-3xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-8 py-5 border-b border-[#F1F5F9]">
          <h2 className="text-2xl font-bold text-[#191B23]">Edit Tugas</h2>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors cursor-pointer"
          >
            <X className="w-6 h-6 text-[#94A3B8]" />
          </button>
        </div>

        {/* Body — Two Column Layout */}
        <div className="flex gap-6 px-8 py-6 flex-1">
          {/* Left Column */}
          <div className="flex flex-col gap-5 w-[496px]">
            {/* Row 1: Mata Pelajaran + Kelas */}
            <div className="flex gap-4">
              <div className="flex flex-col gap-1.5 flex-1">
                <label className="text-xs text-[#191B23]">
                  Mata Pelajaran
                </label>
                <div className="h-12 px-3 bg-[#F3F3FE] border border-[#C3C6D7] rounded-lg flex items-center text-sm text-[#191B23]">
                  {subjectName || "Matematika"}
                </div>
              </div>
              <div className="flex flex-col gap-1.5 flex-1">
                <label className="text-xs text-[#191B23]">Kelas</label>
                <div className="h-12 px-3 bg-[#F3F3FE] border border-[#C3C6D7] rounded-lg flex items-center text-sm text-[#191B23]">
                  {className}
                </div>
              </div>
            </div>

            {/* Row 2: Nama Tugas */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-[#191B23]">Nama Tugas</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Contoh: Analisis Vektor Bagian 1"
                className="h-12 px-3 bg-[#F3F3FE] border border-[#C3C6D7] rounded-lg text-sm text-[#191B23] placeholder:text-[#7F7F7F] outline-none focus:border-[#003FA3] transition-colors"
              />
            </div>

            {/* Row 3: Lampiran Tugas */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-[#191B23]">Lampiran Tugas</label>
              <input
                type="url"
                value={attachmentUrl}
                onChange={(e) => setAttachmentUrl(e.target.value)}
                placeholder="https://example.com/lampiran"
                className="h-12 px-3 bg-[#F3F3FE] border border-[#C3C6D7] rounded-lg text-sm text-[#191B23] placeholder:text-[#7F7F7F] outline-none focus:border-[#003FA3] transition-colors"
              />
            </div>

            {/* Row 4: Starting Date + Deadline */}
            <div className="flex gap-4">
              <div className="flex flex-col gap-1.5 flex-1">
                <label className="text-xs text-[#191B23]">Starting Date</label>
                <div className="relative">
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="h-12 w-full px-3 pr-10 bg-[#F3F3FE] border border-[#C3C6D7] rounded-lg text-sm text-[#191B23] outline-none focus:border-[#003FA3] transition-colors"
                  />
                  <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#94A3B8] pointer-events-none" />
                </div>
              </div>
              <div className="flex flex-col gap-1.5 flex-1">
                <label className="text-xs text-[#191B23]">Deadline</label>
                <div className="relative">
                  <input
                    type="date"
                    value={deadline}
                    onChange={(e) => setDeadline(e.target.value)}
                    className="h-12 w-full px-3 pr-10 bg-[#F3F3FE] border border-[#C3C6D7] rounded-lg text-sm text-[#191B23] outline-none focus:border-[#003FA3] transition-colors"
                  />
                  <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#94A3B8] pointer-events-none" />
                </div>
              </div>
            </div>
          </div>

          {/* Right Column — Detail Tugas */}
          <div className="flex flex-col gap-1.5 flex-1">
            <label className="text-xs text-[#191B23]">Detail Tugas</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Tuliskan detail tugas di sini..."
              className="flex-1 min-h-[300px] p-3 bg-[#F3F3FE] border border-[#C3C6D7] rounded-lg text-sm text-[#191B23] placeholder:text-[#7F7F7F] outline-none focus:border-[#003FA3] transition-colors resize-none"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end px-8 py-5 bg-[#F8FAFC] gap-4">
          <button
            type="button"
            onClick={onClose}
            disabled={mutation.isPending}
            className="px-8 py-3 border border-black rounded-xl text-base text-[#424654] hover:bg-gray-50 transition-colors cursor-pointer disabled:opacity-50"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={() => mutation.mutate()}
            disabled={mutation.isPending || !title.trim()}
            className="px-8 py-3 bg-[#003FA3] rounded-xl text-base text-white hover:bg-[#003080] transition-colors disabled:opacity-50 cursor-pointer flex items-center gap-2"
          >
            {mutation.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
            Kirim
          </button>
        </div>
      </div>
    </div>
  );
}
