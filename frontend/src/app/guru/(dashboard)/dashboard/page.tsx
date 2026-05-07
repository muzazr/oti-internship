"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { StatsCards } from "@/components/guru/dashboard/stats-cards";
import { CTACards } from "@/components/guru/dashboard/cta-cards";
import { SubmissionChart } from "@/components/guru/dashboard/submission-chart";
import { RecentSubmissions } from "@/components/guru/dashboard/recent-submissions";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";

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

const CHART_ORDER = ["Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu", "Minggu"];

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

      // --- Profile ---
      const { data: profile } = await supabase
        .from("profiles")
        .select("full_name")
        .eq("id", session.user.id)
        .single();

      if (profile) {
        setUserName(profile.full_name || "Guru");
      }

      // --- Fetch all dashboard data from backend API (bypasses RLS) ---
      try {
        const res = await fetch(`${API_BASE}/dashboard/stats`, {
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
        });

        if (res.ok) {
          const result = await res.json();
          const data = result.data;

          setStats({
            totalStudents: data.stats.total_students || 0,
            activeAssignments: data.stats.active_assignments || 0,
            deadlinesToday: data.stats.deadlines_today || 0,
            submitted: data.stats.submitted || 0,
            notSubmitted: data.stats.not_submitted || 0,
            participationRate: data.stats.participation_rate || 0,
          });

          if (data.weekly_trend && data.weekly_trend.length > 0) {
            setWeeklyData(data.weekly_trend);
          }

          if (data.recent_submissions && data.recent_submissions.length > 0) {
            setRecentSubmissions(data.recent_submissions);
          }
        }
      } catch (err) {
        console.error("Failed to fetch dashboard stats:", err);
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
