"use client";

import { useState } from "react";
import { StudentInfoCard } from "./student-info-card";

interface GradingPanelProps {
  studentName: string;
  studentCode: string | null;
  submissionStatus: "submitted" | "late" | "graded";
  submittedAt: string;
  deadline: string | null;
  initialScore: number | null;
  initialFeedback: string | null;
  onSubmitGrade: (score: number, feedback: string, sendWA: boolean) => void;
  onSaveDraft: (score: number, feedback: string) => void;
  isSubmitting: boolean;
}

export function GradingPanel({
  studentName,
  studentCode,
  submissionStatus,
  submittedAt,
  deadline,
  initialScore,
  initialFeedback,
  onSubmitGrade,
  onSaveDraft,
  isSubmitting,
}: GradingPanelProps) {
  const [score, setScore] = useState<string>(
    initialScore !== null ? String(initialScore) : ""
  );
  const [feedback, setFeedback] = useState(initialFeedback || "");
  const [sendWA, setSendWA] = useState(false);

  const handleSubmitGrade = () => {
    const numScore = Number(score);
    if (isNaN(numScore) || numScore < 0 || numScore > 100) return;
    onSubmitGrade(numScore, feedback, sendWA);
  };

  const handleSaveDraft = () => {
    const numScore = Number(score);
    if (isNaN(numScore) || numScore < 0 || numScore > 100) return;
    onSaveDraft(numScore, feedback);
  };

  return (
    <aside className="flex w-[352px] shrink-0 flex-col gap-4">
      {/* Student Info Card */}
      <StudentInfoCard
        name={studentName}
        studentCode={studentCode}
        status={submissionStatus}
        submittedAt={submittedAt}
        deadline={deadline}
      />

      {/* Grading Form */}
      <div className="rounded-xl border border-[#F3F4F6] bg-white p-4">
        <div className="flex flex-col gap-5">
          {/* Score */}
          <div className="flex flex-col gap-2">
            <label className="text-base text-[#424654]">Nilai (Score)</label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min={0}
                max={100}
                value={score}
                onChange={(e) => setScore(e.target.value)}
                placeholder="0"
                className="h-[53px] w-20 rounded-lg border border-[#C3C6D7] bg-[#F3F3FE] px-3 text-center text-xl font-bold text-[#191B23] outline-none focus:border-[#2563EB]"
              />
              <span className="text-2xl font-bold text-[#D1D5DB]">/</span>
              <span className="text-xl font-bold text-[#9CA3AF]">100</span>
            </div>
          </div>

          {/* Feedback */}
          <div className="flex flex-col gap-2">
            <label className="text-base text-[#424654]">
              Catatan Penilaian (Feedback)
            </label>
            <textarea
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder="Write your feedback here..."
              className="h-[225px] w-full resize-none rounded-lg border border-[#C3C6D7] bg-[#F3F3FE] p-4 text-base text-[#191B23] outline-none focus:border-[#2563EB]"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col gap-3">
            <button
              onClick={handleSubmitGrade}
              disabled={isSubmitting || !score}
              className="flex h-12 w-full items-center justify-center rounded-xl bg-[#003FA3] text-base text-white transition-colors hover:bg-[#003080] disabled:opacity-50"
            >
              {isSubmitting ? "Mengirim..." : "Kirim Nilai"}
            </button>
            <button
              onClick={handleSaveDraft}
              disabled={isSubmitting || !score}
              className="flex h-12 w-full items-center justify-center rounded-xl bg-[#EFF6FF] text-base text-[#2563EB] transition-colors hover:bg-[#DBEAFE] disabled:opacity-50"
            >
              Simpan Draft
            </button>
          </div>

          {/* WA Checkbox */}
          <label className="flex cursor-pointer items-center gap-3">
            <input
              type="checkbox"
              checked={sendWA}
              onChange={(e) => setSendWA(e.target.checked)}
              className="h-5 w-5 rounded border-[#C3C6D7] bg-white"
            />
            <span className="text-sm text-[#424654]">
              Kirim NIlai siswa dengan Bot WA
            </span>
          </label>
        </div>
      </div>
    </aside>
  );
}
