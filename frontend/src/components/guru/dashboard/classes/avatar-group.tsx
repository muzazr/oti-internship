"use client";

interface AvatarGroupProps {
  totalCount: number;
  maxVisible?: number;
}

const avatarColors = [
  "bg-blue-400",
  "bg-emerald-400",
  "bg-amber-400",
  "bg-rose-400",
  "bg-violet-400",
];

export function AvatarGroup({ totalCount, maxVisible = 2 }: AvatarGroupProps) {
  const visibleCount = Math.min(maxVisible, totalCount);
  const remaining = totalCount - visibleCount;

  return (
    <div className="flex items-center">
      {Array.from({ length: visibleCount }).map((_, index) => (
        <div
          key={index}
          className={`flex h-8 w-8 items-center justify-center rounded-full border-2 border-white text-xs font-bold text-white ${
            avatarColors[index % avatarColors.length]
          }`}
          style={{ marginLeft: index === 0 ? 0 : "-8px" }}
        >
          {String.fromCharCode(65 + index)}
        </div>
      ))}

      {remaining > 0 && (
        <div
          className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-[#EDEDF8]"
          style={{ marginLeft: "-8px" }}
        >
          <span className="text-[10px] font-bold text-[#191B23]">
            +{remaining}
          </span>
        </div>
      )}
    </div>
  );
}
