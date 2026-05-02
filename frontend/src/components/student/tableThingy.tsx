import React from "react"

let lrVariant = []
let udVariant = []

const Table = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="flex-col border border-neutral-300 px-4 *:py-4 divide-y divide-solid divide-neutral-300">
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

// For
export const UpDown = ({ info, content }: itemProps) => {
  // Summary
}

export default Table
