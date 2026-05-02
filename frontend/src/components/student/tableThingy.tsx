import React from "react"

const Table = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="flex-col w-full rounded-2xl border border-neutral-300 px-4 *:py-3 divide-y divide-solid divide-neutral-300">
      {children}
    </div>
  )
}

interface itemProps {
  info: string
  content: React.ReactNode
}

// For left-right info-content
export const LeftRight = ({ info, content }: itemProps) => {
  return (
    <div className="flex justify-between items-center w-full">
      <p className="text-neutral-700">{info}</p>
      <p className="text-right font-medium">{content}</p>
    </div>
  )
}

// For up-down info-content
export const UpDown = ({ info, content }: itemProps) => {
  return (
    <div className="flex flex-col gap-1">
      <p className="text-foreground-secondary text-xs font-bold">{info}</p>
      <p className="text-foreground text-lg font-medium flex items-center gap-2">
        {content}
      </p>
    </div>
  )
}

export default Table
