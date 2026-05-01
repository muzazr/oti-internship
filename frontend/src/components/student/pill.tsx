import React from "react"
import { X, Check } from "lucide-react"

interface Props {
  finished?: boolean
  forStatus?: boolean
  children?: React.ReactNode
  className?: string
}

const Pill = ({
  finished = false,
  forStatus = true,
  children = "",
  className = "",
}: Props) => {
  const classNames = `flex items-center gap-2 text-sm py-1.5 px-3 rounded-2xl font-bold ${className}`
  if (forStatus) {
    return (
      <span
        style={{
          backgroundColor: `var(--${finished ? "success-200" : "error-300"})`,
          color: `var(--${finished ? "success-100" : "error-100"})`,
          flexDirection: `row${finished ? "-reverse" : ""}`,
        }}
        className={classNames}
      >
        <span className="*:size-3.5 outline-2 outline-current bg-current rounded-2xl">
          {finished ? (
            <Check className="stroke-success-200 stroke-3" />
          ) : (
            <X className="stroke-error-300" />
          )}
        </span>{" "}
        {finished ? "Sudah" : "Belum"} Dikumpulkan
      </span>
    )
  } else {
    return <span className={classNames}>{children}</span>
  }
}

export default Pill
