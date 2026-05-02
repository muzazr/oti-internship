import Image from "next/image";

interface AvatarGroupProps {
  avatars: string[];
  totalCount: number;
  maxVisible?: number;
}

export function AvatarGroup({
  avatars,
  totalCount,
  maxVisible = 2,
}: AvatarGroupProps) {
  const visibleAvatars = avatars.slice(0, maxVisible);
  const remaining = totalCount - visibleAvatars.length;

  return (
    <div className="flex items-center">
      {visibleAvatars.map((src, index) => (
        <div
          key={index}
          className="relative h-8 w-8 overflow-hidden rounded-full border-2 border-white"
          style={{ marginLeft: index === 0 ? 0 : "-8px" }}
        >
          <Image
            src={src}
            alt={`Student ${index + 1}`}
            fill
            className="object-cover"
          />
        </div>
      ))}

      {remaining > 0 && (
        <div
          className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-[#EDEDED]"
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
