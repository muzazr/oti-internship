"use client";

import {
  Users,
  FileWarning,
  UserCheck,
  UserX,
  TrendingUp,
  CheckCircle,
  AlertTriangle,
  Clock,
} from "lucide-react";
import { type LucideIcon } from "lucide-react";

interface StatsCardsProps {
  totalStudents: number;
  activeAssignments: number;
  deadlinesToday: number;
  submitted: number;
  notSubmitted: number;
  participationRate: number;
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

export function StatsCards({
  totalStudents,
  activeAssignments,
  deadlinesToday,
  submitted,
  notSubmitted,
  participationRate,
}: StatsCardsProps) {
  const cards: StatCard[] = [
    {
      label: "Total Siswa",
      value: totalStudents.toLocaleString(),
      trend: { text: "12% bulan ini", icon: TrendingUp, color: "#16A34A" },
      icon: Users,
      iconColor: "#2563EB",
      iconBg: "#EFF6FF",
    },
    {
      label: "Tugas Aktif",
      value: activeAssignments.toString(),
      trend: {
        text: `${deadlinesToday} deadline hari ini`,
        icon: Clock,
        color: "#2563EB",
      },
      icon: FileWarning,
      iconColor: "#D97706",
      iconBg: "#FFFBEB",
    },
    {
      label: "Sudah Kumpul",
      value: submitted.toLocaleString(),
      trend: {
        text: `${participationRate}% tingkat partisipasi`,
        icon: CheckCircle,
        color: "#16A34A",
      },
      icon: UserCheck,
      iconColor: "#059669",
      iconBg: "#ECFDF5",
    },
    {
      label: "Belum Kumpul",
      value: notSubmitted.toLocaleString(),
      trend: {
        text: "Perlu follow-up",
        icon: AlertTriangle,
        color: "#BA1A1A",
      },
      icon: UserX,
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
            className="flex h-[140px] items-start justify-between rounded-xl border border-[#F9FAFB] bg-white p-4 shadow-[0_4px_4px_rgba(0,0,0,0.05)]"
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
