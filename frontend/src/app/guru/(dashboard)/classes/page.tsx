"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { ClassCard } from "@/components/guru/dashboard/classes/class-card";
import { CreateClassCard } from "@/components/guru/dashboard/classes/create-class-card";
import { CreateClassModal } from "@/components/guru/dashboard/classes/create-class-modal";
import { DeleteClassDialog } from "@/components/guru/dashboard/classes/delete-class-dialog";
import { fetchClasses, type ClassData } from "@/lib/api/classes";

export default function ClassesPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [isAuthChecked, setIsAuthChecked] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{
    id: string;
    name: string;
  } | null>(null);

  // Auth guard
  useEffect(() => {
    async function checkAuth() {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) {
        router.push("/guru/login");
        return;
      }
      setIsAuthChecked(true);
    }
    checkAuth();
  }, [router]);

  // Fetch classes from Supabase directly
  const {
    data: classes,
    isLoading,
    isError,
    refetch,
  } = useQuery<ClassData[]>({
    queryKey: ["classes"],
    queryFn: fetchClasses,
    enabled: isAuthChecked,
    retry: 1,
  });

  const handleDelete = (classId: string) => {
    const classItem = classes?.find((c) => c.id === classId);
    if (classItem) {
      setDeleteTarget({ id: classItem.id, name: classItem.name });
    }
  };

  // Called after Supabase confirms the class is deleted
  const handleDeleted = useCallback(() => {
    if (!deleteTarget) return;
    const deletedId = deleteTarget.id;

    // 1. Close the dialog immediately
    setDeleteTarget(null);

    // 2. Remove the class from the cache so the card disappears instantly
    queryClient.setQueryData<ClassData[]>(["classes"], (old) =>
      old ? old.filter((c) => c.id !== deletedId) : []
    );

    // 3. Refetch from server to confirm deletion persisted
    refetch();
  }, [deleteTarget, queryClient, refetch]);

  const handleDetail = (classId: string) => {
    router.push(`/guru/classes/${classId}`);
  };

  const getStudentCount = (classItem: ClassData): number => {
    if (classItem.students && classItem.students.length > 0) {
      return classItem.students[0].count;
    }
    return 0;
  };

  // Show loading while checking auth
  if (!isAuthChecked) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="animate-pulse text-base text-[#565F6B]">Memuat...</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8">
      {/* Welcome Section */}
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold text-[#191B23]">Classes Overview</h1>
        <p className="text-base text-[#565F6B]">
          Berikut kelas anda, silahkan menambahkan kelas apabila diperlukan
        </p>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 xl:grid-cols-3">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="h-[367px] animate-pulse rounded-xl border border-[#E1E2ED] bg-white"
            />
          ))}
        </div>
      )}

      {/* Error State */}
      {isError && (
        <div className="flex flex-col items-center justify-center gap-4 py-16">
          <p className="text-base text-[#565F6B]">
            Gagal memuat data kelas. Silakan coba lagi.
          </p>
          <button
            onClick={() => refetch()}
            className="rounded-lg bg-[#003FA3] px-6 py-2 text-sm text-white transition-colors hover:bg-[#003080] cursor-pointer"
          >
            Muat Ulang
          </button>
        </div>
      )}

      {/* Card Grid */}
      {!isLoading && !isError && (
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 xl:grid-cols-3">
          {classes?.map((classItem) => (
            <ClassCard
              key={classItem.id}
              id={classItem.id}
              name={classItem.name}
              subjectName={classItem.subjects?.name}
              studentCount={getStudentCount(classItem)}
              onDelete={handleDelete}
              onDetail={handleDetail}
            />
          ))}

          {/* Create New Class Card */}
          <CreateClassCard onClick={() => setShowCreateModal(true)} />
        </div>
      )}

      {/* Create Class Modal */}
      {showCreateModal && (
        <CreateClassModal onClose={() => setShowCreateModal(false)} />
      )}

      {/* Delete Class Dialog */}
      {deleteTarget && (
        <DeleteClassDialog
          classId={deleteTarget.id}
          classTitle={deleteTarget.name}
          onClose={() => setDeleteTarget(null)}
          onDeleted={handleDeleted}
        />
      )}
    </div>
  );
}
