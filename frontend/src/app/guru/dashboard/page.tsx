"use client";

import { useQuery } from "@tanstack/react-query";
import { Sidebar } from "@/components/guru/dashboard/sidebar";
import { Header } from "@/components/guru/dashboard/header";
import { StatsCards } from "@/components/guru/dashboard/stats-cards";
import { SubmissionChart } from "@/components/guru/dashboard/submission-chart";
import { RecentSubmissions } from "@/components/guru/dashboard/recent-submissions";
import { CTACards } from "@/components/guru/dashboard/cta-cards";
import {
  fetchDashboardStats,
  fetchUserProfile,
  type DashboardStats,
  type UserProfile,
} from "@/lib/api/dashboard";

export default function DashboardPage() {
  const { data: stats, isLoading: statsLoading } = useQuery<DashboardStats>({
    queryKey: ["dashboard-stats"],
    queryFn: fetchDashboardStats,
  });

  const { data: profile } = useQuery<UserProfile>({
    queryKey: ["user-profile"],
    queryFn: fetchUserProfile,
  });

  // Determine greeting based on time of day
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Selamat pagi";
    if (hour < 15) return "Selamat siang";
    if (hour < 18) return "Selamat sore";
    return "Selamat malam";
  };

  const userName = profile?.full_name || "Guru";
  const userRole =
    profile?.role === "teacher" ? "Guru Matematika" : profile?.role || "";

  return (
    <div className="flex min-h-screen bg-[#FAF8FF]">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className="ml-[256px] flex-1 flex flex-col min-h-screen">
        {/* Header */}
        <Header userName={userName} userRole={userRole} />

        {/* Page Content */}
        <main className="flex-1 p-8 overflow-y-auto">
          {/* Greeting */}
          <div className="mb-6">
            <h2 className="text-[28px] font-bold text-[#191B23]">
              {getGreeting()}, {userName}
            </h2>
            <p className="text-base text-[#565F6B] mt-1">
              Berikut adalah ringkasan perkembangan akademik siswa Anda hari ini.
            </p>
          </div>

          {/* Stats Cards */}
          {statsLoading ? (
            <div className="grid grid-cols-4 gap-5 mb-8">
              {[...Array(4)].map((_, i) => (
                <div
                  key={i}
                  className="bg-white rounded-xl h-[140px] animate-pulse border border-[#F9FAFB]"
                />
              ))}
            </div>
          ) : stats ? (
            <div className="mb-8">
              <StatsCards
                totalStudents={stats.stats.total_students}
                activeAssignments={stats.stats.active_assignments}
                deadlinesToday={stats.stats.deadlines_today}
                submitted={stats.stats.submitted}
                notSubmitted={stats.stats.not_submitted}
                participationRate={stats.stats.participation_rate}
              />
            </div>
          ) : null}

          {/* Chart + Recent Submissions */}
          <div className="flex gap-5 mb-8">
            <SubmissionChart weeklyData={stats?.weekly_trend || []} />
            <RecentSubmissions submissions={stats?.recent_submissions || []} />
          </div>

          {/* CTA Cards */}
          <CTACards />
        </main>
      </div>
    </div>
  );
}
