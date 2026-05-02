import Image from "next/image";
import { MoreVertical, Pin, ArrowRight } from "lucide-react";
import { AvatarGroup } from "./avatar-group";
import type { ClassData } from "@/lib/data/mock-classes";

interface ClassCardProps {
  classData: ClassData;
}

export function ClassCard({ classData }: ClassCardProps) {
  const {
    name,
    coverImage,
    studentCount,
    isPinned,
    avatars,
    buttonLabel,
  } = classData;

  return (
    <div className="flex flex-col overflow-hidden rounded-xl border border-[#E1E2ED] bg-white transition-shadow hover:shadow-md">
      {/* Cover Image */}
      <div className="relative mx-4 mt-4 h-32 overflow-hidden rounded-lg">
        <Image
          src={coverImage}
          alt={`Cover for ${name}`}
          fill
          className="object-cover"
        />
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col gap-3 p-4">
        {/* Title Row */}
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-bold text-[#191B23]">{name}</h3>
          <div className="flex items-center gap-1">
            {isPinned && (
              <Pin className="h-4 w-4 fill-[#FA0909] text-[#FA0909]" />
            )}
            <button
              aria-label="More options"
              className="p-0.5 text-[#737686] transition-colors hover:text-[#191B23]"
            >
              <MoreVertical className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Student Count */}
        <p className="text-sm text-[#424654]">{studentCount} Students</p>

        {/* Avatar Group */}
        <AvatarGroup avatars={avatars} totalCount={studentCount} />

        {/* CTA Button */}
        <button className="mt-auto flex w-full items-center justify-between rounded-lg bg-[#003FA3] px-4 py-2.5 text-white transition-colors hover:bg-[#0050CC]">
          <span className="text-xs">{buttonLabel}</span>
          <ArrowRight className="h-4 w-4" strokeWidth={2} />
        </button>
      </div>
    </div>
  );
}
