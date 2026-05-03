"use client";

import { useRouter } from "next/navigation";
import Image from "next/image";
import type { StudentSubmissionStatus } from "@/lib/api/submissions";

interface StudentGradingRowProps {
  data: StudentSubmissionStatus;
  onScoreChange?: (studentId: string, score: number) => void;
}

export function StudentGradingRow({ data, onScoreChange }: StudentGradingRowProps) {
  const router = useRouter();
  const { student, submission, hasSubmitted } = data;

  const handleReview = () => {
    if (submission) {
      router.push(`/guru/submissions/${submission.id}/preview`);
    }
  };

  return (
    <div
      className={`flex items-center justify-between rounded-xl border px-6 py-4 ${
        hasSubmitted
          ? "border-[#F1F5F9] bg-white"
          : "border-[#E2E8F0] bg-[#F8FAFC]"
      }`}
    >
      {/* Left: Avatar + Info */}
      <div className="flex items-center gap-3">
        <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-full bg-[#E1E2ED]">
          <Image
            src={`https://i.pravatar.cc/80?u=${student.id}`}
            alt={student.full_name}
            fill
            className="object-cover"
          />
        </div>
        <div>
          <p className="text-base text-[#191B23]">{student.full_name}</p>
          <p className="text-base text-[#565F6B]">
            Student ID: {student.student_code || "—"}
          </p>
        </div>
      </div>

      {/* Right: Status + Score + Review */}
      <div className="flex items-center gap-4">
        {/* Status Badge */}
        {hasSubmitted ? (
          <div className="flex items-center gap-1.5 rounded-full bg-[#DCFCE7] px-3 py-2">
            <span className="material-icons text-[14px] text-[#15803D]">
              check_circle
            </span>
            <span className="text-xs font-bold text-[#15803D]">Submitted</span>
          </div>
        ) : (
          <div className="flex items-center gap-1.5 rounded-full bg-[#FFDAD6] px-3 py-2">
            <span className="text-xs font-bold text-[#93000A]">
              Not Submitted
            </span>
            <span className="material-icons text-[14px] text-[#93000A]">
              cancel
            </span>
          </div>
        )}

        {/* Score + Review */}
        <div className="flex items-center gap-2">
          <span className="text-base text-[#565F6B]">Score:</span>
          {hasSubmitted ? (
            <input
              type="number"
              min={0}
              max={100}
              defaultValue={submission?.score ?? ""}
              placeholder="-"
              onChange={(e) => {
                if (onScoreChange) {
                  onScoreChange(student.id, Number(e.target.value));
                }
              }}
              className="h-10 w-16 rounded-lg border border-[#DBEAFE] bg-white text-center text-base font-bold text-[#003FA3] outline-none placeholder:text-[#8C8D91] placeholder:font-bold focus:border-[#2563EB]"
            />
          ) : (
            <div className="flex h-10 w-16 items-center justify-center rounded-lg bg-[#E2E8F0]">
              <span className="text-base font-bold text-[#8C8D91]">-</span>
            </div>
          )}

          {/* Review Button */}
          <button
            onClick={handleReview}
            disabled={!hasSubmitted}
            className={`flex items-center gap-1 ${
              hasSubmitted
                ? "text-[#003FA3] hover:opacity-80"
                : "text-[#94A3B8]"
            }`}
          >
            <span className="material-icons text-[14px]">visibility</span>
            <span className="text-base">Review</span>
          </button>
        </div>
      </div>
    </div>
  );
}
