"use client";

interface ClassThumbnailProps {
  classId: string;
  subjectName?: string;
}

// Predefined gradient pairs for visual variety
const gradientPairs = [
  { from: "#667eea", to: "#764ba2" },
  { from: "#f093fb", to: "#f5576c" },
  { from: "#4facfe", to: "#00f2fe" },
  { from: "#43e97b", to: "#38f9d7" },
  { from: "#fa709a", to: "#fee140" },
  { from: "#a18cd1", to: "#fbc2eb" },
  { from: "#fccb90", to: "#d57eeb" },
  { from: "#e0c3fc", to: "#8ec5fc" },
  { from: "#f5576c", to: "#ff9a9e" },
  { from: "#667eea", to: "#43e97b" },
];

// Simple hash function to get consistent gradient per class
function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  return Math.abs(hash);
}

export function ClassThumbnail({ classId, subjectName }: ClassThumbnailProps) {
  const index = hashString(classId) % gradientPairs.length;
  const gradient = gradientPairs[index];

  return (
    <div
      className="flex h-32 w-full items-center justify-center overflow-hidden rounded-lg"
      style={{
        background: `linear-gradient(135deg, ${gradient.from} 0%, ${gradient.to} 100%)`,
      }}
    >
      {subjectName && (
        <span className="select-none text-lg font-bold tracking-wide text-white/90 drop-shadow-sm">
          {subjectName}
        </span>
      )}
    </div>
  );
}
