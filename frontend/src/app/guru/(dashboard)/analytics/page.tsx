"use client";

import { useState, useMemo, useCallback } from "react";
import { ChevronDown } from "lucide-react";
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

// ─── Mock Data ───────────────────────────────────────────────────────────────

const mockClasses = [
  { id: "all", name: "Semua Kelas" },
  { id: "class-1", name: "Kelas 9A" },
  { id: "class-2", name: "Kelas 9B" },
  { id: "class-3", name: "Kelas 8A" },
];

const mockAssignmentFilters = [
  { id: "all", title: "Semua Tugas" },
  { id: "asg-1", title: "Tugas Matematika Bab 1" },
  { id: "asg-2", title: "Essay Bahasa Indonesia" },
  { id: "asg-3", title: "Laporan Praktikum IPA" },
  { id: "asg-4", title: "Tugas Bahasa Inggris" },
  { id: "asg-5", title: "Tugas Matematika Bab 2" },
];

const mockStudents = [
  { id: "s1", name: "Ahmad Fauzi", avgScore: 85.2, submitted: 5, late: 1, notSubmitted: 0 },
  { id: "s2", name: "Budi Santoso", avgScore: 72.0, submitted: 4, late: 2, notSubmitted: 1 },
  { id: "s3", name: "Citra Dewi", avgScore: 91.5, submitted: 6, late: 0, notSubmitted: 0 },
  { id: "s4", name: "Dian Permata", avgScore: 68.3, submitted: 3, late: 1, notSubmitted: 2 },
  { id: "s5", name: "Eko Prasetyo", avgScore: 55.0, submitted: 2, late: 1, notSubmitted: 3 },
  { id: "s6", name: "Fitri Handayani", avgScore: 88.7, submitted: 5, late: 1, notSubmitted: 0 },
  { id: "s7", name: "Galih Pratama", avgScore: 79.4, submitted: 4, late: 2, notSubmitted: 0 },
  { id: "s8", name: "Hana Safitri", avgScore: 94.2, submitted: 6, late: 0, notSubmitted: 0 },
  { id: "s9", name: "Irfan Hakim", avgScore: 62.8, submitted: 3, late: 2, notSubmitted: 1 },
  { id: "s10", name: "Jasmine Putri", avgScore: 76.5, submitted: 4, late: 1, notSubmitted: 1 },
  { id: "s11", name: "Kevin Wijaya", avgScore: 83.1, submitted: 5, late: 0, notSubmitted: 1 },
  { id: "s12", name: "Lina Marlina", avgScore: 70.9, submitted: 4, late: 2, notSubmitted: 0 },
];

const mockParticipation = [
  { assignment: "Matematika Bab 1", sudah: 20, terlambat: 4, belum: 3 },
  { assignment: "Essay B.Indo", sudah: 18, terlambat: 5, belum: 4 },
  { assignment: "Praktikum IPA", sudah: 22, terlambat: 3, belum: 2 },
  { assignment: "B. Inggris", sudah: 15, terlambat: 6, belum: 6 },
  { assignment: "Matematika Bab 2", sudah: 24, terlambat: 2, belum: 1 },
];

// Per-class mock data variants
const mockDataByClass: Record<
  string,
  {
    students: typeof mockStudents;
    participation: typeof mockParticipation;
  }
> = {
  all: { students: mockStudents, participation: mockParticipation },
  "class-1": {
    students: mockStudents.slice(0, 8).map((s) => ({
      ...s,
      avgScore: s.avgScore + 2,
      submitted: Math.min(s.submitted + 1, 6),
    })),
    participation: mockParticipation.map((p) => ({
      ...p,
      sudah: p.sudah + 2,
      belum: Math.max(p.belum - 1, 0),
    })),
  },
  "class-2": {
    students: mockStudents.slice(3, 10).map((s) => ({
      ...s,
      avgScore: Math.max(s.avgScore - 3, 40),
    })),
    participation: mockParticipation.map((p) => ({
      ...p,
      sudah: Math.max(p.sudah - 3, 5),
      terlambat: p.terlambat + 2,
    })),
  },
  "class-3": {
    students: mockStudents.slice(5, 12).map((s) => ({
      ...s,
      avgScore: s.avgScore + 5,
      late: Math.max(s.late - 1, 0),
    })),
    participation: mockParticipation.map((p) => ({
      ...p,
      sudah: p.sudah + 4,
      terlambat: Math.max(p.terlambat - 2, 0),
      belum: Math.max(p.belum - 1, 0),
    })),
  },
};

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
  const [selectedClass, setSelectedClass] = useState("all");
  const [selectedAssignment, setSelectedAssignment] = useState("all");

  // Get data based on selected class
  const currentData = useMemo(() => {
    return mockDataByClass[selectedClass] || mockDataByClass["all"];
  }, [selectedClass]);

  // Compute stats
  const stats = useMemo(() => {
    const students = currentData.students;
    const totalStudents = students.length;
    const averageScore =
      totalStudents > 0
        ? students.reduce((sum, s) => sum + s.avgScore, 0) / totalStudents
        : 0;
    const submitted = students.reduce((sum, s) => sum + s.submitted, 0);
    const late = students.reduce((sum, s) => sum + s.late, 0);
    const notSubmitted = students.reduce((sum, s) => sum + s.notSubmitted, 0);

    return { averageScore, submitted, late, notSubmitted, totalStudents };
  }, [currentData]);

  // Get class name for display
  const selectedClassName = useMemo(() => {
    return mockClasses.find((c) => c.id === selectedClass)?.name || "Semua Kelas";
  }, [selectedClass]);

  // ─── Export Handlers ─────────────────────────────────────────────────────

  const handleExportCSV = useCallback(() => {
    const exportData: StudentRecapExport[] = currentData.students.map((s) => ({
      name: s.name,
      avgScore: s.avgScore,
      submitted: s.submitted,
      late: s.late,
      notSubmitted: s.notSubmitted,
      status: getStudentStatus(s),
    }));
    exportToCSV(exportData, selectedClassName);
  }, [currentData, selectedClassName]);

  const handleExportExcel = useCallback(() => {
    const studentExport: StudentRecapExport[] = currentData.students.map((s) => ({
      name: s.name,
      avgScore: s.avgScore,
      submitted: s.submitted,
      late: s.late,
      notSubmitted: s.notSubmitted,
      status: getStudentStatus(s),
    }));
    const participationExport: ParticipationExport[] =
      currentData.participation.map((p) => ({
        assignment: p.assignment,
        sudah: p.sudah,
        terlambat: p.terlambat,
        belum: p.belum,
      }));
    exportToExcel(studentExport, participationExport, selectedClassName);
  }, [currentData, selectedClassName]);

  const handleExportImage = useCallback(() => {
    exportToImage("analytics-charts-section", selectedClassName);
  }, [selectedClassName]);

  // ─── Render ──────────────────────────────────────────────────────────────

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
              onChange={(e) => setSelectedClass(e.target.value)}
              className="w-full appearance-none rounded-lg border border-[#E5E7EB] bg-white py-2.5 pl-3 pr-9 text-sm font-medium text-[#191B23] outline-none transition-colors focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB] sm:w-[180px]"
            >
              {mockClasses.map((cls) => (
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
              className="w-full appearance-none rounded-lg border border-[#E5E7EB] bg-white py-2.5 pl-3 pr-9 text-sm font-medium text-[#191B23] outline-none transition-colors focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB] sm:w-[220px]"
            >
              {mockAssignmentFilters.map((asg) => (
                <option key={asg.id} value={asg.id}>
                  {asg.title}
                </option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9CA3AF]" />
          </div>
        </div>

        {/* Export Button */}
        <ExportMenu
          onExportCSV={handleExportCSV}
          onExportExcel={handleExportExcel}
          onExportImage={handleExportImage}
        />
      </div>

      {/* Stats Cards */}
      <AnalyticsStatsCards
        averageScore={stats.averageScore}
        submitted={stats.submitted}
        late={stats.late}
        notSubmitted={stats.notSubmitted}
        totalStudents={stats.totalStudents}
      />

      {/* Charts Section (wrapped for image export) */}
      <div
        id="analytics-charts-section"
        className="flex flex-col gap-5 xl:flex-row xl:gap-6"
      >
        <ParticipationBarChart data={currentData.participation} />
        <SubmissionPieChart
          submitted={stats.submitted}
          late={stats.late}
          notSubmitted={stats.notSubmitted}
        />
      </div>

      {/* AI Insight */}
      <AIInsightCard className={selectedClassName} />

      {/* Student Recap Table */}
      <StudentRecapTable students={currentData.students} />
    </div>
  );
}
