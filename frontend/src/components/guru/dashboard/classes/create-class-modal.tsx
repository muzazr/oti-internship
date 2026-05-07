"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { X, Info, Loader2 } from "lucide-react";
import {
  createClassSchema,
  type CreateClassFormData,
} from "@/lib/schemas/create-class";
import {
  createClass,
  createSubject,
  fetchSubjects,
  type ClassData,
  type SubjectData,
} from "@/lib/api/classes";

interface CreateClassModalProps {
  onClose: () => void;
}

export function CreateClassModal({ onClose }: CreateClassModalProps) {
  const queryClient = useQueryClient();

  // Fetch existing subjects for matching
  const { data: subjects } = useQuery<SubjectData[]>({
    queryKey: ["subjects"],
    queryFn: fetchSubjects,
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateClassFormData>({
    resolver: zodResolver(createClassSchema),
    defaultValues: {
      name: "",
      subject_name: "",
    },
  });

  const mutation = useMutation({
    mutationFn: async (data: CreateClassFormData) => {
      // Try to handle subject linking
      let subjectId: string | undefined;

      try {
        const existingSubject = subjects?.find(
          (s) => s.name.toLowerCase() === data.subject_name.toLowerCase()
        );

        if (existingSubject) {
          subjectId = existingSubject.id;
        } else if (data.subject_name.trim()) {
          // Create new subject
          const newSubject = await createSubject(data.subject_name);
          subjectId = newSubject.id;
        }
      } catch {
        // If subject creation fails, continue without it
        console.warn("Could not create/link subject, creating class without it");
      }

      // Create the class (works with or without subject_id column)
      return createClass({
        name: data.name,
        subject_id: subjectId,
      });
    },
    onSuccess: (newClass) => {
      // Add the new class to the cache so it appears immediately
      queryClient.setQueryData<ClassData[]>(["classes"], (old) =>
        old ? [newClass, ...old] : [newClass]
      );
      // Refetch subjects only (not classes — we already have the correct state)
      queryClient.invalidateQueries({ queryKey: ["subjects"] });
      onClose();
    },
  });

  const onSubmit = (data: CreateClassFormData) => {
    mutation.mutate(data);
  };

  // Close on Escape key
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
      aria-labelledby="create-class-title"
    >
      <div className="w-[448px] bg-white border border-[#C3C6D7] rounded-xl p-6 space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h2
            id="create-class-title"
            className="text-2xl font-bold text-[#191B23]"
          >
            Buat Kelas Baru
          </h2>
          <button
            onClick={onClose}
            className="p-1 rounded-full hover:bg-gray-100 transition-colors cursor-pointer"
            aria-label="Tutup modal"
          >
            <X className="w-6 h-6 text-[#737686]" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          {/* Kelas Field */}
          <div className="space-y-2">
            <label
              htmlFor="class-name"
              className="block text-xs text-[#191B23]"
            >
              Kelas
            </label>
            <input
              id="class-name"
              {...register("name")}
              placeholder="e.g. Kelas X IPA 1"
              className="w-full h-12 px-3 bg-[#F3F3FE] border border-[#C3C6D7] rounded-lg text-base text-[#191B23] placeholder:text-[#8C8D91] outline-none focus:border-[#003FA3] transition-colors"
              aria-describedby={errors.name ? "name-error" : undefined}
            />
            {errors.name && (
              <p id="name-error" className="text-xs text-[#BA1A1A]">
                {errors.name.message}
              </p>
            )}
          </div>

          {/* Nama Mata Pelajaran Field */}
          <div className="space-y-2">
            <label
              htmlFor="subject-name"
              className="block text-xs text-[#191B23]"
            >
              Nama Mata Pelajaran
            </label>
            <input
              id="subject-name"
              {...register("subject_name")}
              placeholder="Matematika"
              list="subject-suggestions"
              className="w-full h-12 px-3 bg-[#F3F3FE] border border-[#C3C6D7] rounded-lg text-base text-[#191B23] placeholder:text-[#8C8D91] outline-none focus:border-[#003FA3] transition-colors"
              aria-describedby={
                errors.subject_name ? "subject-error" : undefined
              }
            />
            {/* Datalist for subject suggestions */}
            {subjects && subjects.length > 0 && (
              <datalist id="subject-suggestions">
                {subjects.map((s) => (
                  <option key={s.id} value={s.name} />
                ))}
              </datalist>
            )}
            {errors.subject_name && (
              <p id="subject-error" className="text-xs text-[#BA1A1A]">
                {errors.subject_name.message}
              </p>
            )}
          </div>

          {/* Info Banner */}
          <div className="flex items-start gap-4 bg-[#EFF6FF] border border-[#DBEAFE] rounded-lg p-4">
            <Info className="w-6 h-6 text-[#003FA3] flex-shrink-0 mt-0.5" />
            <p className="text-xs text-[#003FA3] leading-relaxed">
              Kelas yang baru dibuat akan otomatis terdaftar dalam daftar aktif.
            </p>
          </div>

          {/* Buttons */}
          <div className="flex justify-end gap-4 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={mutation.isPending}
              className="px-8 py-3 border border-black rounded-lg text-base text-[#565F6B] hover:bg-gray-50 transition-colors cursor-pointer disabled:opacity-50"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={mutation.isPending}
              className="px-8 py-3 bg-[#003FA3] rounded-lg text-base text-white hover:bg-[#003080] transition-colors disabled:opacity-50 cursor-pointer flex items-center gap-2"
            >
              {mutation.isPending && (
                <Loader2 className="w-4 h-4 animate-spin" />
              )}
              Buat Kelas
            </button>
          </div>

          {/* Error Message */}
          {mutation.isError && (
            <p className="text-xs text-[#BA1A1A] text-center">
              {mutation.error?.message ||
                "Gagal membuat kelas. Silakan coba lagi."}
            </p>
          )}
        </form>
      </div>
    </div>
  );
}
