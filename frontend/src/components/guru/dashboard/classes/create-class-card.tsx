import { Plus } from "lucide-react";

export function CreateClassCard() {
  return (
    <button
      className="flex min-h-[249px] flex-col items-center justify-center gap-4 rounded-xl border-2 border-dashed border-[#C3C6D7] bg-[#F3F3FE] transition-colors hover:border-[#003FA3] hover:bg-[#EEEEFE]"
      aria-label="Create a new class"
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
