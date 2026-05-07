"use client";

import {
  GraduationCap,
  CheckCircle,
  Clock,
  XCircle,
  TrendingUp,
  Percent,
  AlertTriangle,
} from "lucide-react";
import { type LucideIcon } from "lucide-react";

interface AnalyticsStatsCardsProps {
  averageScore: number;
  submitted: number;
  late: number;
  notSubmitted: number;
  totalStudents: number;
}

interface StatCard {
  label: string;
  value: string;
  trend: {
    text: string;
    icon: LucideIcon;
    color: string;
  };
  icon: LucideIcon;
  iconColor: string;
  iconBg: string;
}

export function AnalyticsStatsCards({
  averageScore,
  submitted,
  late,
  notSubmitted,
  totalStudents,
}: AnalyticsStatsCardsProps) {
  const total = submitted + late + notSubmitted;
  const submittedPct = total > 0 ? Math.round((submitted / total) * 100) : 0;
  const latePct = total > 0 ? Math.round((late / total) * 100) : 0;
  const notSubmittedPct = total > 0 ? Math.round((notSubmitted / total) * 100) : 0;

  const cards: StatCard[] = [
    {
      label: "Rata-rata Nilai",
      value: averageScore.toFixed(1),
      trend: {
        text: `${totalStudents} siswa aktif`,
        icon: TrendingUp,
        color: "#16A34A",
      },
      icon: GraduationCap,
      iconColor: "#2563EB",
      iconBg: "#EFF6FF",
    },
    {
      label: "Sudah Kumpul",
      value: submitted.toString(),
      trend: {
        text: `${submittedPct}% dari total`,
        icon: Percent,
        color: "#16A34A",
      },
      icon: CheckCircle,
      iconColor: "#059669",
      iconBg: "#ECFDF5",
    },
    {
      label: "Terlambat",
      value: late.toString(),
      trend: {
        text: `${latePct}% dari total`,
        icon: Clock,
        color: "#D97706",
      },
      icon: Clock,
      iconColor: "#D97706",
      iconBg: "#FFFBEB",
    },
    {
      label: "Belum Kumpul",
      value: notSubmitted.toString(),
      trend: {
        text: `${notSubmittedPct}% perlu follow-up`,
        icon: AlertTriangle,
        color: "#E11D48",
      },
      icon: XCircle,
      iconColor: "#E11D48",
      iconBg: "#FFF1F2",
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-[15px] sm:grid-cols-2 xl:grid-cols-4">
      {cards.map((card) => {
        const TrendIcon = card.trend.icon;
        const CardIcon = card.icon;
        return (
          <div
            key={card.label}
            className="flex min-h-[140px] items-start justify-between rounded-xl border border-[#F9FAFB] bg-white p-4 shadow-[0_4px_4px_rgba(0,0,0,0.05)]"
          >
            {/* Left content */}
            <div className="flex h-full flex-col justify-between">
              <p className="text-xs font-bold text-[#565F6B]">{card.label}</p>
              <p className="text-[28px] font-black leading-tight text-[#191B23]">
                {card.value}
              </p>
              <div className="flex items-center gap-1">
                <TrendIcon
                  className="h-4 w-4"
                  style={{ color: card.trend.color }}
                />
                <span
                  className="text-xs font-bold"
                  style={{ color: card.trend.color }}
                >
                  {card.trend.text}
                </span>
              </div>
            </div>

            {/* Right icon */}
            <div
              className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg"
              style={{ backgroundColor: card.iconBg }}
            >
              <CardIcon
                className="h-7 w-7"
                style={{ color: card.iconColor }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
