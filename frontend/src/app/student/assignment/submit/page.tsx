"use client"

import React from "react"
import { useState } from "react"
import { ArrowLeft } from "lucide-react"

import { Step1, Step2, Step3 } from "@/modules/student/steps"
// For step 1, step 2, and the other pages, just ctrl+click the "@/modules/student/steps". Everything is there

import Progress from "@/components/student/progress"
import Button from "@/components/student/button"

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
      {progress !== 2 && (
        <Button
          className="rounded-full w-fit!"
          link={progress === 0 ? "./" : ""}
          onClick={() => {
            if (progress > 0) setProgress(progress - 1)
          }}
        >
          <ArrowLeft className="size-4.5" /> Kembali
        </Button>
      )}
      <div>
        <p className="text-foreground-secondary font-bold text-xs">
          Langkah {progress + 1} dari {steps.length}
        </p>
        <Progress
          className="w-full mt-2 h-2 bg-neutral-300"
          progressColor="var(--primary-500)"
          value={progress + 1}
          max={steps.length}
        />
      </div>
      <StepNumber onClick={() => setProgress(progress + 1)} />
    </div>
  )
}

export default SubmissionPage
