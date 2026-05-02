"use client"

import React from "react"
import { useState } from "react"
import { Step1, Step2, Step3 } from "@/modules/student/steps"
// For step 1, step 2, and the other pages, just ctrl+click the "@/modules/student/steps". Everything is there

const steps = [
  { component: Step1, label: "Langkah 1" },
  { component: Step2, label: "Langkah 2" },
  { component: Step3, label: "Submission Verdict" },
]

const SubmissionPage = () => {
  const [progress, setProgress] = useState(0)

  const StepNumber = steps[progress].component
  return (
    <div className="flex gap-4 flex-col items-start *:w-full">
      <StepNumber
        progress={progress}
        next={() => setProgress(progress + 1)}
        prev={() => {
          if (progress > 0) setProgress(progress - 1)
        }}
        stepsAmount={steps.length}
      />
    </div>
  )
}

export default SubmissionPage
