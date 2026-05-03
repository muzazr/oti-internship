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
    <div className="flex w-full flex-shrink-0 flex-col rounded-xl border border-[#F9FAFB] bg-white p-4 shadow-[0_4px_4px_rgba(0,0,0,0.05)] sm:p-6 xl:w-[349px]">
      {/* Header */}
      <div className="mb-5 flex items-center justify-between">
        <h3 className="text-xl font-bold text-[#191B23]">Submisi Terbaru</h3>
        <Link
          href="/guru/submissions"
          className="text-xs font-bold text-[#003FA3] hover:underline"
        >
          Lihat Semua
        </Link>
      </div>

      {/* Submission List */}
      <div className="flex flex-col gap-2">
        {submissions.map((sub) => {
          const timeAgo = getTimeAgo(sub.submitted_at);
          const isNew = timeAgo === "Baru";
          const avatarColor = getAvatarColor(sub.student_initials);

          return (
            <div
              key={sub.id}
              className="flex items-center gap-3 rounded-xl bg-[#F3F3FE] p-4"
            >
              {/* Avatar */}
              <div
                className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full"
                style={{ backgroundColor: avatarColor }}
              >
                <span className="text-xs font-bold text-white">
                  {sub.student_initials}
                </span>
              </div>

              {/* Info */}
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-bold text-[#191B23]">
                  {sub.student_name}
                </p>
                <p className="truncate text-[10px] text-[#565F6B]">
                  {sub.subject_name} &bull; {sub.class_name}
                </p>
              </div>

              {/* Time / Badge */}
              {isNew ? (
                <span className="whitespace-nowrap rounded-full bg-[#F0FDF4] px-2 py-0.5 text-[10px] font-bold text-[#16A34A]">
                  Baru
                </span>
              ) : (
                <span className="whitespace-nowrap text-[10px] font-medium text-[#565F6B]">
                  {timeAgo}
                </span>
              )}
            </div>
          );
        })}

        {submissions.length === 0 && (
          <p className="py-8 text-center text-sm text-[#8C8D91]">
            Belum ada submisi terbaru
          </p>
        )}
      </div>
    </div>
  );
}
