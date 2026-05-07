"use client";

interface StudentNavigationFooterProps {
  currentIndex: number;
  totalStudents: number;
  onPrevious: () => void;
  onNext: () => void;
}

export function StudentNavigationFooter({
  currentIndex,
  totalStudents,
  onPrevious,
  onNext,
}: StudentNavigationFooterProps) {
  const isFirst = currentIndex <= 0;
  const isLast = currentIndex >= totalStudents - 1;

  return (
    <footer className="border-t border-[#F3F4F6] bg-white px-10 py-4">
      <div className="flex items-center justify-center">
        <div className="flex items-center gap-6">
          {/* Previous */}
          <button
            onClick={onPrevious}
            disabled={isFirst}
            className="flex items-center gap-2 py-2 text-base text-[#6B7280] transition-colors hover:text-[#191B23] disabled:opacity-40"
          >
            <span>Previous Student</span>
            <span className="material-icons text-2xl">chevron_left</span>
          </button>

          {/* Divider */}
          <div className="h-4 w-px bg-[#E5E7EB]" />

          {/* Counter */}
          <span className="text-sm text-[#424654]">
            Student{" "}
            <span className="font-bold text-[#191B23]">{currentIndex + 1}</span>{" "}
            of {totalStudents}
          </span>

          {/* Divider */}
          <div className="h-4 w-px bg-[#E5E7EB]" />

          {/* Next */}
          <button
            onClick={onNext}
            disabled={isLast}
            className="flex items-center gap-2 py-2 text-base text-[#003FA3] transition-colors hover:text-[#002D75] disabled:opacity-40"
          >
            <span>Next Student</span>
            <span className="material-icons text-2xl">chevron_right</span>
          </button>
        </div>
      </div>
    </footer>
  );
}
