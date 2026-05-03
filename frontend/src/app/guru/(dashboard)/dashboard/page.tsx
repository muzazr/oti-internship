"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { StatsCards } from "@/components/guru/dashboard/stats-cards";
import { CTACards } from "@/components/guru/dashboard/cta-cards";
import { SubmissionChart } from "@/components/guru/dashboard/submission-chart";
import { RecentSubmissions } from "@/components/guru/dashboard/recent-submissions";

interface DashboardStats {
  totalStudents: number;
  activeAssignments: number;
  deadlinesToday: number;
  submitted: number;
  notSubmitted: number;
  participationRate: number;
}

interface ChartDay {
  day: string;
  count: number;
}

interface RecentSubmission {
  id: string;
  student_name: string;
  student_initials: string;
  class_name: string;
  subject_name: string;
  submitted_at: string;
  status: string;
}

const DAY_NAMES = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
const CHART_ORDER = ["Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu", "Minggu"];

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Selamat pagi";
  if (hour < 15) return "Selamat siang";
  if (hour < 18) return "Selamat sore";
  return "Selamat malam";
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join("");
}

export default function DashboardPage() {
  const router = useRouter();
  const [userName, setUserName] = useState("Guru");
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats>({
    totalStudents: 0,
    activeAssignments: 0,
    deadlinesToday: 0,
    submitted: 0,
    notSubmitted: 0,
    participationRate: 0,
  });
  const [weeklyData, setWeeklyData] = useState<ChartDay[]>(
    CHART_ORDER.map((day) => ({ day, count: 0 }))
  );
  const [recentSubmissions, setRecentSubmissions] = useState<RecentSubmission[]>([]);

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

      // --- Profile ---
      const { data: profile } = await supabase
        .from("profiles")
        .select("full_name")
        .eq("id", teacherId)
        .single();

      if (profile) {
        setUserName(profile.full_name || "Guru");
      }

      // --- Classes & Students ---
      const { data: classes } = await supabase
        .from("classes")
        .select("id")
        .eq("teacher_id", teacherId);

      const classIds = classes?.map((c) => c.id) || [];

      let totalStudents = 0;
      if (classIds.length > 0) {
        const { count } = await supabase
          .from("students")
          .select("*", { count: "exact", head: true })
          .in("class_id", classIds);
        totalStudents = count || 0;
      }

      // --- Assignments ---
      const { data: assignments } = await supabase
        .from("assignments")
        .select("id, deadline")
        .eq("teacher_id", teacherId)
        .eq("status", "published");

      const activeAssignments = assignments?.length || 0;
      const assignmentIds = assignments?.map((a) => a.id) || [];

      const today = new Date().toISOString().split("T")[0];
      const deadlinesToday =
        assignments?.filter((a) => a.deadline?.startsWith(today)).length || 0;

      // --- Submissions count ---
      let submitted = 0;
      if (assignmentIds.length > 0) {
        const { count } = await supabase
          .from("submissions")
          .select("*", { count: "exact", head: true })
          .in("assignment_id", assignmentIds);
        submitted = count || 0;
      }

      const totalExpected = totalStudents * activeAssignments;
      const notSubmitted = Math.max(0, totalExpected - submitted);
      const participationRate =
        totalExpected > 0 ? Math.round((submitted / totalExpected) * 100) : 0;

      setStats({
        totalStudents,
        activeAssignments,
        deadlinesToday,
        submitted,
        notSubmitted,
        participationRate,
      });

      // --- Weekly chart data (last 7 days from submissions) ---
      if (assignmentIds.length > 0) {
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        const { data: chartSubmissions } = await supabase
          .from("submissions")
          .select("submitted_at")
          .in("assignment_id", assignmentIds)
          .gte("submitted_at", sevenDaysAgo.toISOString())
          .order("submitted_at", { ascending: true });

        if (chartSubmissions && chartSubmissions.length > 0) {
          const dayCounts: Record<string, number> = {};
          for (const dayName of CHART_ORDER) {
            dayCounts[dayName] = 0;
          }

          for (const sub of chartSubmissions) {
            const date = new Date(sub.submitted_at);
            const dayName = DAY_NAMES[date.getDay()];
            dayCounts[dayName] = (dayCounts[dayName] || 0) + 1;
          }

          setWeeklyData(
            CHART_ORDER.map((day) => ({ day, count: dayCounts[day] || 0 }))
          );
        }
      }

      // --- Recent submissions (last 5) ---
      if (assignmentIds.length > 0) {
        const { data: recentSubs } = await supabase
          .from("submissions")
          .select(
            `
            id,
            status,
            submitted_at,
            students!inner(full_name, class_id, classes!inner(name)),
            assignments!inner(subject_id, subjects(name))
          `
          )
          .in("assignment_id", assignmentIds)
          .order("submitted_at", { ascending: false })
          .limit(5);

        if (recentSubs && recentSubs.length > 0) {
          const mapped: RecentSubmission[] = recentSubs.map((sub) => {
            const student = sub.students as unknown as {
              full_name: string;
              class_id: string;
              classes: { name: string };
            };
            const assignment = sub.assignments as unknown as {
              subject_id: string;
              subjects: { name: string } | null;
            };

            return {
              id: sub.id,
              student_name: student.full_name,
              student_initials: getInitials(student.full_name),
              class_name: student.classes?.name || "-",
              subject_name: assignment.subjects?.name || "-",
              submitted_at: sub.submitted_at,
              status: sub.status,
            };
          });

          setRecentSubmissions(mapped);
        }
      }

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
    <div className="flex flex-col gap-5 sm:gap-6">
      {/* Welcome Section */}
      <div className="flex flex-col gap-1">
        <h1 className="text-xl font-bold text-[#191B23] sm:text-2xl">
          {getGreeting()}, {userName}
        </h1>
        <p className="text-sm text-[#565F6B] sm:text-base">
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
        <SubmissionChart weeklyData={weeklyData} />
        <RecentSubmissions submissions={recentSubmissions} />
      </div>

      {/* CTA Cards */}
      <CTACards />
    </div>
  );
}
