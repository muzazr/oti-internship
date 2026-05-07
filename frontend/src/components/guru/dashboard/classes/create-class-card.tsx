"use client";

import { Plus } from "lucide-react";

interface CreateClassCardProps {
  onClick: () => void;
}

export function CreateClassCard({ onClick }: CreateClassCardProps) {
  return (
    <button
      onClick={onClick}
      className="flex min-h-[249px] flex-col items-center justify-center gap-4 rounded-xl border-2 border-dashed border-[#C3C6D7] bg-[#F3F3FE] transition-all hover:border-[#003FA3] hover:scale-[1.02] cursor-pointer"
      aria-label="Buat kelas baru"
    >
      {/* Add Circle */}
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#003FA3]">
        <Plus className="h-8 w-8 text-white" strokeWidth={2} />
      </div>

      {/* Label */}
      <span className="text-xl text-[#191B23]">Create New Class</span>
    </button>
  );
}
