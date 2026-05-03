"use client";

interface AssignmentCardProps {
  title: string;
  description: string | null;
  submittedCount: number;
  totalStudents: number;
}

function getProgressColor(percent: number): string {
  if (percent >= 100) return "text-[#2563EB]";
  if (percent >= 80) return "text-[#059669]";
  return "text-[#D97706]";
}

export function AssignmentCard({
  title,
  description,
  submittedCount,
  totalStudents,
}: AssignmentCardProps) {
  const percent =
    totalStudents > 0 ? Math.round((submittedCount / totalStudents) * 100) : 0;
  const barWidth =
    totalStudents > 0
      ? `${Math.min(100, (submittedCount / totalStudents) * 100)}%`
      : "0%";

  return (
    <div className="bg-white border border-[#F1F5F9] rounded-xl p-4 w-[268px] flex-shrink-0 flex flex-col gap-3">
      {/* Title */}
      <h4 className="text-xl font-bold text-[#191B23] truncate">{title}</h4>

      {/* Description */}
      <p className="text-sm text-[#64748B] line-clamp-2 min-h-[34px]">
        {description || "Tidak ada deskripsi"}
      </p>

      {/* Progress */}
      <div className="flex flex-col gap-1.5">
        <div className="flex items-center justify-between">
          <span className="text-xs text-[#94A3B8]">Submission Progress</span>
          <span className={`text-xs ${getProgressColor(percent)}`}>
            {percent}%
          </span>
        </div>
        <div className="w-full h-2 bg-[#F1F5F9] rounded-full overflow-hidden">
          <div
            className="h-full bg-[#10B981] rounded-full transition-all"
            style={{ width: barWidth }}
          />
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-[#64748B]">
          {submittedCount}/{totalStudents} Students
        </span>
        <span className="text-xs text-[#2563EB] cursor-pointer hover:underline">
          Details
        </span>
      </div>
    </div>
  );
}
