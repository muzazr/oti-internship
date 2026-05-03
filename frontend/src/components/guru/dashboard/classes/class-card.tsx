"use client";

import { MoreVertical, Trash2, ArrowRight } from "lucide-react";
import { AvatarGroup } from "./avatar-group";
import { ClassThumbnail } from "./class-thumbnail";

interface ClassCardProps {
  id: string;
  name: string;
  subjectName?: string;
  studentCount: number;
  buttonLabel?: string;
  onDelete: (id: string) => void;
  onDetail: (id: string) => void;
}

export function ClassCard({
  id,
  name,
  subjectName,
  studentCount,
  buttonLabel = "Detail Kelas",
  onDelete,
  onDetail,
}: ClassCardProps) {
  return (
    <div className="flex flex-col overflow-hidden rounded-xl border border-[#E1E2ED] bg-white transition-shadow hover:shadow-md">
      {/* Cover Thumbnail (auto-generated gradient) */}
      <div className="mx-4 mt-4">
        <ClassThumbnail classId={id} subjectName={subjectName} />
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col gap-3 p-4">
        {/* Title Row */}
        <div className="flex items-center justify-between">
          <h3 className="truncate flex-1 mr-2 text-xl font-bold text-[#191B23]">
            {name}
          </h3>
          <div className="flex items-center gap-1 flex-shrink-0">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete(id);
              }}
              className="rounded-md p-1 text-[#FA0909] transition-colors hover:bg-red-50 cursor-pointer"
              aria-label="Hapus kelas"
            >
              <Trash2 className="h-4 w-4" />
            </button>
            <button
              className="rounded-md p-0.5 text-[#737686] transition-colors hover:text-[#191B23] cursor-pointer"
              aria-label="More options"
            >
              <MoreVertical className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Student Count */}
        <p className="text-sm text-[#424654]">{studentCount} Students</p>

        {/* Avatar Group */}
        <AvatarGroup totalCount={studentCount} maxVisible={2} />

        {/* CTA Button */}
        <button
          onClick={() => onDetail(id)}
          className="mt-auto flex w-full items-center justify-between rounded-lg bg-[#003FA3] px-4 py-2.5 text-white transition-colors hover:bg-[#0050CC] cursor-pointer"
        >
          <span className="text-xs">{buttonLabel}</span>
          <ArrowRight className="h-4 w-4" strokeWidth={2} />
        </button>
      </div>
    </div>
  );
}
