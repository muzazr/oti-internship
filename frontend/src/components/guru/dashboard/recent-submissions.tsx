"use client";

import Link from "next/link";

interface Submission {
  id: string;
  student_name: string;
  student_initials: string;
  class_name: string;
  subject_name: string;
  submitted_at: string;
  status: string;
}

interface RecentSubmissionsProps {
  submissions: Submission[];
}

// Deterministic color based on initials (matches Figma avatar colors)
const avatarColors = ["#2563EB", "#9333EA", "#D97706", "#E11D48", "#059669"];

function getAvatarColor(initials: string): string {
  const charSum = initials
    .split("")
    .reduce((sum, c) => sum + c.charCodeAt(0), 0);
  return avatarColors[charSum % avatarColors.length];
}

function getTimeAgo(dateStr: string): string {
  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);

  if (diffMin < 1) return "Baru";
  if (diffMin < 60) return `${diffMin}m lalu`;
  const diffHours = Math.floor(diffMin / 60);
  if (diffHours < 24) return `${diffHours}j lalu`;
  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays}h lalu`;
}

export function RecentSubmissions({ submissions }: RecentSubmissionsProps) {
  return (
    <div className="bg-white rounded-xl border border-[#F9FAFB] shadow-[0_4px_4px_rgba(0,0,0,0.05)] p-6 w-[349px] flex-shrink-0">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <h3 className="text-lg font-bold text-[#191B23]">Submisi Terbaru</h3>
        <Link
          href="/guru/submissions"
          className="text-xs font-medium text-[#003FA3] hover:underline"
        >
          Lihat Semua
        </Link>
      </div>

      {/* Submission List */}
      <div className="flex flex-col gap-3">
        {submissions.map((sub) => {
          const timeAgo = getTimeAgo(sub.submitted_at);
          const isNew = timeAgo === "Baru";
          const avatarColor = getAvatarColor(sub.student_initials);

          return (
            <div
              key={sub.id}
              className="flex items-center gap-3 bg-[#F3F3FE] rounded-xl p-4"
            >
              {/* Avatar */}
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: avatarColor }}
              >
                <span className="text-xs font-bold text-white">
                  {sub.student_initials}
                </span>
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-[#191B23] truncate">
                  {sub.student_name}
                </p>
                <p className="text-xs text-[#565F6B] truncate">
                  {sub.subject_name} &bull; {sub.class_name}
                </p>
              </div>

              {/* Time / Badge */}
              {isNew ? (
                <span className="px-2 py-0.5 bg-[#F0FDF4] text-[#16A34A] text-xs font-medium rounded-full whitespace-nowrap">
                  Baru
                </span>
              ) : (
                <span className="text-xs text-[#565F6B] whitespace-nowrap">
                  {timeAgo}
                </span>
              )}
            </div>
          );
        })}

        {submissions.length === 0 && (
          <p className="text-sm text-[#8C8D91] text-center py-8">
            Belum ada submisi terbaru
          </p>
        )}
      </div>
    </div>
  );
}
