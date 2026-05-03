"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft } from "lucide-react";
import { supabase } from "@/lib/supabase";
import {
  fetchClassById,
  fetchTeacherProfile,
  fetchStudentsByClass,
  type ClassInfo,
  type TeacherProfile,
  type Student,
} from "@/lib/api/class-detail";
import { fetchAssignmentsByClass, type Assignment } from "@/lib/api/assignments";
import { fetchSubjects, type SubjectData } from "@/lib/api/classes";
import { TugasTab } from "@/components/guru/dashboard/classes/detail/tabs/tugas-tab";
import { PeopleTab } from "@/components/guru/dashboard/classes/detail/tabs/people-tab";

type TabType = "tugas" | "people";

export default function ClassDetailPage() {
  const params = useParams();
  const router = useRouter();
  const classId = params.id as string;
  const [isAuthChecked, setIsAuthChecked] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>("tugas");

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

  // Fetch class info
  const { data: classInfo } = useQuery<ClassInfo>({
    queryKey: ["class", classId],
    queryFn: () => fetchClassById(classId),
    enabled: isAuthChecked,
  });

  // Fetch teacher profile
  const { data: teacher } = useQuery<TeacherProfile>({
    queryKey: ["teacher", classInfo?.teacher_id],
    queryFn: () => fetchTeacherProfile(classInfo!.teacher_id),
    enabled: !!classInfo?.teacher_id,
  });

  // Fetch students
  const { data: students = [] } = useQuery<Student[]>({
    queryKey: ["students", classId],
    queryFn: () => fetchStudentsByClass(classId),
    enabled: isAuthChecked,
  });

  // Fetch assignments
  const { data: assignments = [] } = useQuery<Assignment[]>({
    queryKey: ["assignments", classId],
    queryFn: () => fetchAssignmentsByClass(classId),
    enabled: isAuthChecked,
  });

  // Fetch teacher's subjects (to resolve subject name)
  const { data: subjects = [] } = useQuery<SubjectData[]>({
    queryKey: ["subjects"],
    queryFn: fetchSubjects,
    enabled: isAuthChecked,
  });

  // Resolve subject name: from class.subjects → from subjects table → from class name
  const resolvedSubjectName = (() => {
    // 1. From class info (if subject_id was linked)
    if (classInfo?.subjects?.name) return classInfo.subjects.name;
    // 2. From teacher's subjects table (first match)
    if (subjects.length > 0) return subjects[0].name;
    // 3. Extract from class name pattern "Subject - ClassName"
    const name = classInfo?.name || "";
    const dashIdx = name.indexOf(" - ");
    if (dashIdx > 0) return name.substring(0, dashIdx).trim();
    // 4. No subject found
    return null;
  })();

  if (!isAuthChecked) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="animate-pulse text-base text-[#565F6B]">Memuat...</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Page Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => router.push("/guru/classes")}
          className="w-10 h-10 bg-white border border-[#E2E8F0] rounded-xl flex items-center justify-center hover:bg-gray-50 transition-colors cursor-pointer"
          aria-label="Kembali ke daftar kelas"
        >
          <ArrowLeft className="w-5 h-5 text-[#475569]" />
        </button>
        <div>
          <h1 className="text-xl font-bold text-[#191B23]">
            {classInfo?.name || "Loading..."}
          </h1>
          <p className="text-sm text-[#424654]">
            Kelas ini dibuat oleh {teacher?.full_name || "..."}
          </p>
        </div>
      </div>

      {/* Tab Bar */}
      <div className="flex border-b border-[#E2E8F0]">
        <button
          onClick={() => setActiveTab("tugas")}
          className={`px-4 pb-3 text-sm transition-colors cursor-pointer ${
            activeTab === "tugas"
              ? "text-[#2563EB] font-medium border-b-2 border-[#2563EB]"
              : "text-[#64748B]"
          }`}
        >
          Tugas
        </button>
        <button
          onClick={() => setActiveTab("people")}
          className={`px-4 pb-3 text-sm transition-colors cursor-pointer ${
            activeTab === "people"
              ? "text-[#2563EB] font-medium border-b-2 border-[#2563EB]"
              : "text-[#64748B]"
          }`}
        >
          People
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === "tugas" && (
        <TugasTab
          classId={classId}
          className={classInfo?.name || ""}
          subjectName={resolvedSubjectName || undefined}
          assignments={assignments}
          students={students}
        />
      )}

      {activeTab === "people" && (
        <PeopleTab
          classId={classId}
          className={classInfo?.name || ""}
          teacher={teacher || null}
          teacherName={teacher?.full_name || "Guru"}
          students={students}
        />
      )}
    </div>
  );
}
