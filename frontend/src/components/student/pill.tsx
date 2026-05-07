import React from "react"
import { X, Check } from "lucide-react"

interface PillProps {
  finished?: boolean;
  forStatus?: boolean;
  className?: string;
  children?: React.ReactNode;
}

const Pill = ({ finished = false, forStatus = true, className = "", children }: PillProps) => {
  if (!forStatus && children) {
    return (
      <span className={`flex items-center gap-2 py-1.5 px-3 rounded-2xl ${className}`}>
        {children}
      </span>
    )
  }

  return (
    <span
      style={{
        backgroundColor: `var(--${finished ? "success-200" : "error-300"})`,
        color: `var(--${finished ? "success-100" : "error-100"})`,
        flexDirection: `row${finished ? "-reverse" : ""}`,
      }}
      className={`flex items-center gap-2 text-sm py-1.5 px-3 rounded-2xl font-bold ${className}`}
    >
      <span className="*:size-3.5 outline-2 outline-current bg-current rounded-2xl">
        {finished ? (
          <Check className="stroke-success-200 stroke-3" />
        ) : (
          <X className="stroke-error-300" />
        )}
      </span>{" "}
      {children || (finished ? "Sudah" : "Belum") + " Dikumpulkan"}
    </span>
  )
}

export default Pill
