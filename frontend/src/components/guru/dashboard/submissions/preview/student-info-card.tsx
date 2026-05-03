"use client";

import Image from "next/image";

interface StudentInfoCardProps {
  name: string;
  studentCode: string | null;
  status: "submitted" | "late" | "graded";
  submittedAt: string;
  deadline: string | null;
}

export function StudentInfoCard({
  name,
  studentCode,
  status,
  submittedAt,
  deadline,
}: StudentInfoCardProps) {
  const isLate = status === "late";
  const submittedDate = new Date(submittedAt);
  const deadlineDate = deadline ? new Date(deadline) : null;
  const isOnTime = deadlineDate ? submittedDate <= deadlineDate : true;

  return (
    <div className="rounded-xl border border-[#F3F4F6] bg-white p-4">
      <div className="flex items-start gap-4">
        <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-full bg-[#E1E2ED]">
          <Image
            src={`https://i.pravatar.cc/112?u=${name}`}
            alt={name}
            fill
            className="object-cover"
          />
        </div>
        <div className="flex flex-col gap-1">
          <p className="text-base text-[#191B23]">{name}</p>
          <p className="text-sm text-[#565F6B]">
            Student ID: {studentCode || "—"}
          </p>
          <div
            className={`inline-flex w-fit items-center rounded-full px-2 py-0.5 ${
              isLate ? "bg-[#FFDAD6]" : "bg-[#DCFCE7]"
            }`}
          >
            <span
              className={`text-xs ${
                isLate ? "text-[#93000A]" : "text-[#15803D]"
              }`}
            >
              {isLate
                ? "Submitted late"
                : isOnTime
                ? "Submitted on time"
                : "Submitted"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
