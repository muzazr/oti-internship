"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { StatsCards } from "@/components/guru/dashboard/stats-cards";
import { CTACards } from "@/components/guru/dashboard/cta-cards";
import { SubmissionChart } from "@/components/guru/dashboard/submission-chart";
import { RecentSubmissions } from "@/components/guru/dashboard/recent-submissions";

interface DashboardData {
  totalStudents: number;
  activeAssignments: number;
  deadlinesToday: number;
  submitted: number;
  notSubmitted: number;
  participationRate: number;
}

const mockWeeklyData = [
  { day: "Senin", count: 45 },
  { day: "Selasa", count: 15 },
  { day: "Rabu", count: 15 },
  { day: "Kamis", count: 15 },
  { day: "Jumat", count: 9 },
  { day: "Sabtu", count: 32 },
  { day: "Minggu", count: 15 },
];

const mockSubmissions = [
  {
    id: "1",
    student_name: "Adi Saputra",
    student_initials: "AS",
    class_name: "XI IPA 1",
    subject_name: "Matematika",
    submitted_at: new Date().toISOString(),
    status: "submitted",
  },
  {
    id: "2",
    student_name: "Budi Nugraha",
    student_initials: "BN",
    class_name: "XI IPA 3",
    subject_name: "Matematika",
    submitted_at: new Date(Date.now() - 2 * 60000).toISOString(),
    status: "submitted",
  },
  {
    id: "3",
    student_name: "Citra Lestari",
    student_initials: "CL",
    class_name: "X IPA 2",
    subject_name: "Matematika",
    submitted_at: new Date(Date.now() - 5 * 60000).toISOString(),
    status: "submitted",
  },
  {
    id: "4",
    student_name: "Dedi Wijaya",
    student_initials: "DW",
    class_name: "XII IPA 4",
    subject_name: "Matematika",
    submitted_at: new Date(Date.now() - 12 * 60000).toISOString(),
    status: "submitted",
  },
];

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Selamat pagi";
  if (hour < 15) return "Selamat siang";
  if (hour < 18) return "Selamat sore";
  return "Selamat malam";
}

export default function DashboardPage() {
  const router = useRouter();
  const [userName, setUserName] = useState("Guru");
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState<DashboardData>({
    totalStudents: 0,
    activeAssignments: 0,
    deadlinesToday: 0,
    submitted: 0,
    notSubmitted: 0,
    participationRate: 0,
  });

  useEffect(() => {
    async function loadDashboard() {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        router.push("/guru/login");
        return;
      }

      const teacherId = session.user.id;

      // Get user profile
      const { data: profile } = await supabase
        .from("profiles")
        .select("full_name")
        .eq("id", teacherId)
        .single();

      if (profile) {
        setUserName(profile.full_name || "Guru");
      }

      // Get teacher's classes
      const { data: classes } = await supabase
        .from("classes")
        .select("id")
        .eq("teacher_id", teacherId);

      const classIds = classes?.map((c) => c.id) || [];

      // Get total students across all classes
      let totalStudents = 0;
      if (classIds.length > 0) {
        const { count } = await supabase
          .from("students")
          .select("*", { count: "exact", head: true })
          .in("class_id", classIds);
        totalStudents = count || 0;
      }

      // Get active assignments
      const { data: assignments } = await supabase
        .from("assignments")
        .select("id, deadline")
        .eq("teacher_id", teacherId)
        .eq("status", "published");

      const activeAssignments = assignments?.length || 0;

      // Count deadlines today
      const today = new Date().toISOString().split("T")[0];
      const deadlinesToday =
        assignments?.filter((a) => a.deadline?.startsWith(today)).length || 0;

      // Get submissions count
      const assignmentIds = assignments?.map((a) => a.id) || [];
      let submitted = 0;
      if (assignmentIds.length > 0) {
        const { count } = await supabase
          .from("submissions")
          .select("*", { count: "exact", head: true })
          .in("assignment_id", assignmentIds);
        submitted = count || 0;
      }

      // Calculate not submitted and participation rate
      const totalExpected = totalStudents * activeAssignments;
      const notSubmitted = Math.max(0, totalExpected - submitted);
      const participationRate =
        totalExpected > 0
          ? Math.round((submitted / totalExpected) * 100)
          : 0;

      setStats({
        totalStudents,
        activeAssignments,
        deadlinesToday,
        submitted,
        notSubmitted,
        participationRate,
      });

      setIsLoading(false);
    }

    loadDashboard();
  }, [router]);

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="animate-pulse text-base text-[#434655]">
          Memuat dashboard...
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Welcome Section */}
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold text-[#191B23]">
          {getGreeting()}, {userName}
        </h1>
        <p className="text-base text-[#565F6B]">
          Berikut adalah ringkasan perkembangan akademik siswa Anda hari ini.
        </p>
      </div>

      {/* Stats Cards */}
      <StatsCards
        totalStudents={stats.totalStudents}
        activeAssignments={stats.activeAssignments}
        deadlinesToday={stats.deadlinesToday}
        submitted={stats.submitted}
        notSubmitted={stats.notSubmitted}
        participationRate={stats.participationRate}
      />

      {/* Mid Section: Chart + Recent Submissions */}
      <div className="flex flex-col gap-5 xl:flex-row xl:gap-7">
        <SubmissionChart weeklyData={mockWeeklyData} />
        <RecentSubmissions submissions={mockSubmissions} />
      </div>

      {/* CTA Cards */}
      <CTACards />
    </div>
  );
}
