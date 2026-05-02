import React from "react"

interface Props {
  progressColor: string
  className?: string
  value: number
  max: number
}

const Progress = ({ className = "", progressColor, value, max }: Props) => {
  return (
    <div className={`rounded-full overflow-hidden ${className}`}>
      <div
        className="h-full rounded-full"
        style={{
          width: `${(value * 100) / max}%`,
          backgroundColor: progressColor,
        }}
      />
    </div>
  )
}

export default Progress
