"use client";

import { Plus } from "lucide-react";

interface FabButtonProps {
  onClick: () => void;
}

export function FabButton({ onClick }: FabButtonProps) {
  return (
    <button
      onClick={onClick}
      className="fixed bottom-8 right-8 w-14 h-14 bg-[#003FA3] rounded-full flex items-center justify-center shadow-lg hover:bg-[#003080] transition-colors cursor-pointer z-40"
      aria-label="Buat tugas baru"
    >
      <Plus className="w-8 h-8 text-white" />
    </button>
  );
}
