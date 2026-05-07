"use client";

import Image from "next/image";
import { MoreVertical, MoreHorizontal } from "lucide-react";

interface MemberRowProps {
  name: string;
  subtitle: string;
  initials?: string;
  avatarUrl?: string;
  variant?: "teacher" | "student";
  onAction?: () => void;
}

export function MemberRow({
  name,
  subtitle,
  initials,
  avatarUrl,
  variant = "student",
  onAction,
}: MemberRowProps) {
  const ActionIcon = variant === "teacher" ? MoreVertical : MoreHorizontal;

  return (
    <div className="flex items-center justify-between px-4 py-4 border-t border-[#C3C6D7]">
      <div className="flex items-center gap-4">
        {/* Avatar */}
        <div
          className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 overflow-hidden relative ${
            avatarUrl ? "bg-[#DAE3F1]" : "bg-[#F1F5F9]"
          }`}
        >
          {avatarUrl ? (
            <Image
              src={avatarUrl}
              alt={name}
              fill
              className="object-cover"
            />
          ) : (
            <span className="text-base font-bold text-[#003FA3]">
              {initials ||
                name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")
                  .toUpperCase()
                  .slice(0, 2)}
            </span>
          )}
        </div>

        {/* Name + Subtitle */}
        <div className="flex flex-col">
          <span className="text-base text-[#191B23]">{name}</span>
          <span className="text-xs text-[#424654]">{subtitle}</span>
        </div>
      </div>

      {/* Action Button */}
      {onAction && (
        <button
          onClick={onAction}
          className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors cursor-pointer"
        >
          <ActionIcon className="w-5 h-5 text-[#424654]" />
        </button>
      )}
    </div>
  );
}
