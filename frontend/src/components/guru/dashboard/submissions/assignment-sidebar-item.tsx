"use client";

interface AssignmentSidebarItemProps {
  title: string;
  gradedCount: number;
  totalStudents: number;
  isSelected: boolean;
  onClick: () => void;
}

export function AssignmentSidebarItem({
  title,
  gradedCount,
  totalStudents,
  isSelected,
  onClick,
}: AssignmentSidebarItemProps) {
  const hasUngraded = gradedCount < totalStudents && totalStudents > 0;

  return (
    <button
      onClick={onClick}
      className={`w-full rounded-lg px-4 py-4 text-left transition-colors ${
        isSelected
          ? "border border-[#2563EB] bg-white"
          : "border border-transparent hover:border-[#E2E8F0]"
      }`}
    >
      <p
        className={`text-base ${
          isSelected ? "text-[#2563EB]" : "text-[#334155]"
        }`}
      >
        {title}
      </p>
      <div className="mt-2 flex items-center gap-2">
        <div
          className={`h-2 w-2 shrink-0 rounded-full ${
            hasUngraded ? "bg-[#BA1A1A]" : "bg-[#CBD5E1]"
          }`}
        />
        <span className="text-base text-[#64748B]">
          {gradedCount}/{totalStudents} Gradings
        </span>
      </div>
    </button>
  );
}
