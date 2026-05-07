"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import { ChevronDown } from "lucide-react";
import { supabase } from "@/lib/supabase";
import {
  fetchAnalyticsData,
  type AnalyticsData,
} from "@/lib/api/analytics";
import { AnalyticsStatsCards } from "@/components/guru/dashboard/analytics/analytics-stats-cards";
import { ParticipationBarChart } from "@/components/guru/dashboard/analytics/participation-bar-chart";
import { SubmissionPieChart } from "@/components/guru/dashboard/analytics/submission-pie-chart";
import { AIInsightCard } from "@/components/guru/dashboard/analytics/ai-insight-card";
import { StudentRecapTable } from "@/components/guru/dashboard/analytics/student-recap-table";
import { ExportMenu } from "@/components/guru/dashboard/analytics/export-menu";
import {
  exportToCSV,
  exportToExcel,
  exportToImage,
  type StudentRecapExport,
  type ParticipationExport,
} from "@/lib/export-utils";

// ─── Helper ──────────────────────────────────────────────────────────────────

function getStudentStatus(student: {
  avgScore: number;
  late: number;
  notSubmitted: number;
}): string {
  if (student.avgScore < 60 || student.notSubmitted > 2) return "Kritis";
  if (student.late > 0 || student.notSubmitted > 0) return "Perlu Perhatian";
  return "Baik";
}

// ─── Page Component ──────────────────────────────────────────────────────────

export default function AnalyticsPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isRefetching, setIsRefetching] = useState(false);
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(
    null
  );
  const [selectedClass, setSelectedClass] = useState("all");
  const [selectedAssignment, setSelectedAssignment] = useState("all");
  const [error, setError] = useState<string | null>(null);

  // ─── Initial load + auth check ─────────────────────────────────────────

  useEffect(() => {
    async function init() {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        router.push("/guru/login");
        return;
      }

      try {
        const data = await fetchAnalyticsData("all", "all");
        setAnalyticsData(data);
      } catch (err) {
        console.error("Failed to load analytics:", err);
        setError("Gagal memuat data analisis. Silakan coba lagi.");
      } finally {
        setIsLoading(false);
      }
    }

    init();
  }, [router]);

  // ─── Refetch when filters change ───────────────────────────────────────

  useEffect(() => {
    // Skip the initial load (handled above)
    if (isLoading) return;

    async function refetch() {
      setIsRefetching(true);
      setError(null);

      try {
        const data = await fetchAnalyticsData(
          selectedClass,
          selectedAssignment
        );
        setAnalyticsData(data);
      } catch (err) {
        console.error("Failed to refetch analytics:", err);
        setError("Gagal memuat data analisis. Silakan coba lagi.");
      } finally {
        setIsRefetching(false);
      }
    }

    refetch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedClass, selectedAssignment]);

  // ─── Reset assignment filter when class changes ────────────────────────

  const handleClassChange = useCallback((classId: string) => {
    setSelectedClass(classId);
    setSelectedAssignment("all");
  }, []);

  // ─── Derived values ────────────────────────────────────────────────────

  const selectedClassName = useMemo(() => {
    if (selectedClass === "all") return "Semua Kelas";
    return (
      analyticsData?.classes.find((c) => c.id === selectedClass)?.name ||
      "Semua Kelas"
    );
  }, [selectedClass, analyticsData]);

  // ─── Export Handlers ───────────────────────────────────────────────────

  const handleExportCSV = useCallback(() => {
    if (!analyticsData) return;
    const exportData: StudentRecapExport[] = analyticsData.students.map(
      (s) => ({
        name: s.name,
        avgScore: s.avgScore,
        submitted: s.submitted,
        late: s.late,
        notSubmitted: s.notSubmitted,
        status: getStudentStatus(s),
      })
    );
    exportToCSV(exportData, selectedClassName);
  }, [analyticsData, selectedClassName]);

  const handleExportExcel = useCallback(() => {
    if (!analyticsData) return;
    const studentExport: StudentRecapExport[] = analyticsData.students.map(
      (s) => ({
        name: s.name,
        avgScore: s.avgScore,
        submitted: s.submitted,
        late: s.late,
        notSubmitted: s.notSubmitted,
        status: getStudentStatus(s),
      })
    );
    const participationExport: ParticipationExport[] =
      analyticsData.participation.map((p) => ({
        assignment: p.assignment,
        sudah: p.sudah,
        terlambat: p.terlambat,
        belum: p.belum,
      }));
    exportToExcel(studentExport, participationExport, selectedClassName);
  }, [analyticsData, selectedClassName]);

  const handleExportImage = useCallback(() => {
    exportToImage("analytics-charts-section", selectedClassName);
  }, [selectedClassName]);

  // ─── Loading State ─────────────────────────────────────────────────────

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="animate-pulse text-base text-[#434655]">
          Memuat analisis...
        </div>
      </div>
    );
  }

  // ─── Error State ───────────────────────────────────────────────────────

  if (error && !analyticsData) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-3">
        <p className="text-sm text-[#E11D48]">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="rounded-lg bg-[#2563EB] px-4 py-2 text-sm font-medium text-white hover:bg-[#1D4ED8]"
        >
          Coba Lagi
        </button>
      </div>
    );
  }

  const data = analyticsData!;

  // ─── Render ────────────────────────────────────────────────────────────

  return (
    <div className="flex flex-col gap-5 sm:gap-6">
      {/* Page Header */}
      <div className="flex flex-col gap-1">
        <h1 className="text-xl font-bold text-[#191B23] sm:text-2xl">
          Analisis & Laporan
        </h1>
        <p className="text-sm text-[#565F6B] sm:text-base">
          Pantau perkembangan akademik siswa secara detail
        </p>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          {/* Class Filter */}
          <div className="relative">
            <select
              value={selectedClass}
              onChange={(e) => handleClassChange(e.target.value)}
              disabled={isRefetching}
              className="w-full appearance-none rounded-lg border border-[#E5E7EB] bg-white py-2.5 pl-3 pr-9 text-sm font-medium text-[#191B23] outline-none transition-colors focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB] disabled:opacity-50 sm:w-[180px]"
            >
              <option value="all">Semua Kelas</option>
              {data.classes.map((cls) => (
                <option key={cls.id} value={cls.id}>
                  {cls.name}
                </option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9CA3AF]" />
          </div>

          {/* Assignment Filter */}
          <div className="relative">
            <select
              value={selectedAssignment}
              onChange={(e) => setSelectedAssignment(e.target.value)}
              disabled={isRefetching}
              className="w-full appearance-none rounded-lg border border-[#E5E7EB] bg-white py-2.5 pl-3 pr-9 text-sm font-medium text-[#191B23] outline-none transition-colors focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB] disabled:opacity-50 sm:w-[220px]"
            >
              <option value="all">Semua Tugas</option>
              {data.assignments.map((asg) => (
                <option key={asg.id} value={asg.id}>
                  {asg.title}
                </option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9CA3AF]" />
          </div>

          {/* Refetching indicator */}
          {isRefetching && (
            <span className="text-xs text-[#8C8D91] animate-pulse">
              Memuat...
            </span>
          )}
        </div>

        {/* Export Button */}
        <ExportMenu
          onExportCSV={handleExportCSV}
          onExportExcel={handleExportExcel}
          onExportImage={handleExportImage}
        />
      </div>

      {/* Empty State: No classes */}
      {data.classes.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-[#F9FAFB] bg-white py-16 shadow-[0_4px_4px_rgba(0,0,0,0.05)]">
          <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-[#EFF6FF]">
            <svg
              className="h-7 w-7 text-[#2563EB]"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25"
              />
            </svg>
          </div>
          <p className="text-sm font-medium text-[#191B23]">
            Belum ada kelas
          </p>
          <p className="mt-1 text-xs text-[#8C8D91]">
            Buat kelas terlebih dahulu di halaman Classes untuk melihat analisis.
          </p>
        </div>
      ) : (
        <>
          {/* Stats Cards */}
          <AnalyticsStatsCards
            averageScore={data.stats.averageScore}
            submitted={data.stats.submitted}
            late={data.stats.late}
            notSubmitted={data.stats.notSubmitted}
            totalStudents={data.stats.totalStudents}
          />

          {/* Charts Section (wrapped for image export) */}
          <div
            id="analytics-charts-section"
            className="flex flex-col gap-5 xl:flex-row xl:gap-6"
          >
            <ParticipationBarChart data={data.participation} />
            <SubmissionPieChart
              submitted={data.stats.submitted}
              late={data.stats.late}
              notSubmitted={data.stats.notSubmitted}
            />
          </div>

          {/* AI Insight */}
          <AIInsightCard className={selectedClassName} />

          {/* Student Recap Table */}
          <StudentRecapTable students={data.students} />
        </>
      )}
    </div>
  );
}
