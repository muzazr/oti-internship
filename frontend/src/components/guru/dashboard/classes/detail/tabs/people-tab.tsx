"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AddMemberForm } from "../people/add-member-form";
import { ClassStatistics } from "../people/class-statistics";
import { TeachersSection } from "../people/teachers-section";
import { StudentsSection } from "../people/students-section";
import { ResultAlert } from "../result-alert";
import {
  addStudent,
  deleteStudent,
  type Student,
  type TeacherProfile,
} from "@/lib/api/class-detail";
import { sendStudentInvite } from "@/lib/api/whatsapp";

interface PeopleTabProps {
  classId: string;
  className: string;
  teacher: TeacherProfile | null;
  teacherName: string;
  students: Student[];
}

type AlertState = {
  variant: "success" | "error";
  title: string;
  description: string;
} | null;

export function PeopleTab({
  classId,
  className,
  teacher,
  teacherName,
  students,
}: PeopleTabProps) {
  const queryClient = useQueryClient();
  const [alert, setAlert] = useState<AlertState>(null);

  const addMutation = useMutation({
    mutationFn: async ({
      fullName,
      whatsappNumber,
    }: {
      fullName: string;
      whatsappNumber: string;
    }) => {
      const student = await addStudent(classId, fullName, whatsappNumber);
      // Try to send WA invite (non-blocking)
      await sendStudentInvite(whatsappNumber, fullName, className, teacherName);
      return student;
    },
    onSuccess: (newStudent) => {
      queryClient.setQueryData<Student[]>(
        ["students", classId],
        (old) => (old ? [...old, newStudent] : [newStudent])
      );
      setAlert({
        variant: "success",
        title: "Siswa berhasil ditambahkan",
        description:
          "Bot WA akan mengirim notifikasi tugas aktif ke nomor tersebut",
      });
    },
    onError: () => {
      setAlert({
        variant: "error",
        title: "Siswa Gagal ditambahkan",
        description: "Coba lagi. Periksa koneksi anda.",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteStudent,
    onSuccess: (_data, deletedId) => {
      queryClient.setQueryData<Student[]>(
        ["students", classId],
        (old) => (old ? old.filter((s) => s.id !== deletedId) : [])
      );
    },
  });

  const handleAddMember = async (
    fullName: string,
    whatsappNumber: string
  ) => {
    addMutation.mutate({ fullName, whatsappNumber });
  };

  return (
    <>
      <div className="flex gap-6">
        {/* Left Panel */}
        <div className="flex flex-col gap-5 flex-shrink-0">
          <AddMemberForm
            onSubmit={handleAddMember}
            isLoading={addMutation.isPending}
          />
          <ClassStatistics
            studentCount={students.length}
            teacherCount={teacher ? 1 : 0}
          />
        </div>

        {/* Right Panel */}
        <div className="flex-1 flex flex-col gap-5">
          <TeachersSection teacher={teacher} />
          <StudentsSection
            students={students}
            onDeleteStudent={(id) => deleteMutation.mutate(id)}
          />
        </div>
      </div>

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
