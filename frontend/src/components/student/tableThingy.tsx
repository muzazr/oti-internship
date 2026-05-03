import React from "react"

// eslint-disable-next-line prefer-const, @typescript-eslint/no-unused-vars
let lrVariant: string[] = []
// eslint-disable-next-line prefer-const, @typescript-eslint/no-unused-vars
let udVariant: string[] = []

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

// For up-down layout
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const UpDown = ({ info, content }: itemProps) => {
  return (
    <div className="flex flex-col w-full">
      <p className="text-neutral-700">{info}</p>
      <p className="font-medium">{content}</p>
    </div>
  )
}

export default Table
